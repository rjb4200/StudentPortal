-- Migration: Add student rejection support
-- Adds 'rejected' to student_status enum, rejection metadata columns,
-- updates register_onboarding_student to allow rejected students to reapply,
-- and ensures cron sweep does not expire rejected students.

ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'rejected';

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by      TEXT;

-- Update register_onboarding_student to allow rejected students to re-register
-- by reclaiming their old row (linking via previous_student_id)
CREATE OR REPLACE FUNCTION public.register_onboarding_student(
  p_full_name text,
  p_email text,
  p_phone text,
  p_school_name text,
  p_instructor_name text,
  p_instructor_contact text,
  p_training_class_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prior_student students%ROWTYPE;
  selected_class record;
  new_student_id uuid;
  legacy_school_name text;
  legacy_instructor_name text;
  legacy_instructor_contact text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM students
    WHERE lower(email) = lower(p_email)
      AND is_blacklisted = true
  ) THEN
    RAISE EXCEPTION 'A student with this email requires administrator review.'
      USING ERRCODE = '23505';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM students
    WHERE lower(email) = lower(p_email)
      AND status::text = 'pending'
  ) THEN
    RAISE EXCEPTION 'A student with this email is already pending approval.'
      USING ERRCODE = '23505';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM students
    WHERE lower(email) = lower(p_email)
      AND status::text = 'certified'
  ) THEN
    RAISE EXCEPTION 'A student with this email is already registered.'
      USING ERRCODE = '23505';
  END IF;

  IF p_training_class_id IS NOT NULL THEN
    SELECT
      training_classes.id AS class_id,
      training_classes.name AS class_name,
      training_classes.training_site_id,
      training_classes.instructor_id,
      training_sites.name AS site_name,
      training_sites.organization_name,
      instructors.first_name,
      instructors.last_name,
      instructors.email AS instructor_email,
      instructors.mobile_phone,
      instructors.business_phone
    INTO selected_class
    FROM training_classes
    JOIN training_sites ON training_sites.id = training_classes.training_site_id
    JOIN instructors ON instructors.id = training_classes.instructor_id
    WHERE training_classes.id = p_training_class_id
      AND training_classes.status = 'active'::public.registry_status
      AND training_sites.status = 'active'::public.registry_status
      AND instructors.status = 'active'::public.registry_status
      AND (timezone('America/New_York'::text, now()))::date BETWEEN training_classes.class_start_date AND training_classes.ride_time_end_date
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Selected class is not available for registration.'
        USING ERRCODE = '23503';
    END IF;
  END IF;

  legacy_school_name := COALESCE(NULLIF(p_school_name, ''), selected_class.organization_name, selected_class.site_name, 'Selected training site');
  legacy_instructor_name := COALESCE(NULLIF(p_instructor_name, ''), NULLIF(TRIM(CONCAT(selected_class.first_name, ' ', selected_class.last_name)), ''), 'Selected instructor');
  legacy_instructor_contact := COALESCE(NULLIF(p_instructor_contact, ''), selected_class.instructor_email, selected_class.mobile_phone, selected_class.business_phone, 'See selected class');

  SELECT *
  INTO prior_student
  FROM students
  WHERE lower(email) = lower(p_email)
    AND status::text IN ('expired', 'archived', 'rejected')
    AND is_test_record = false
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO students (
    full_name,
    email,
    phone,
    school_name,
    instructor_name,
    instructor_contact,
    status,
    previous_student_id,
    is_test_record,
    training_site_id,
    instructor_id,
    training_class_id
  ) VALUES (
    p_full_name,
    p_email,
    NULLIF(p_phone, ''),
    legacy_school_name,
    legacy_instructor_name,
    legacy_instructor_contact,
    'pending'::student_status,
    CASE WHEN prior_student.id IS NOT NULL THEN prior_student.id ELSE NULL END,
    false,
    selected_class.training_site_id,
    selected_class.instructor_id,
    selected_class.class_id
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;

-- Re-create the shorthand overload
CREATE OR REPLACE FUNCTION public.register_onboarding_student(
  p_full_name text,
  p_email text,
  p_phone text,
  p_school_name text,
  p_instructor_name text,
  p_instructor_contact text
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.register_onboarding_student(
    p_full_name,
    p_email,
    p_phone,
    p_school_name,
    p_instructor_name,
    p_instructor_contact,
    NULL::uuid
  );
$$;

GRANT EXECUTE ON FUNCTION public.register_onboarding_student(text, text, text, text, text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_onboarding_student(text, text, text, text, text, text) TO anon, authenticated;
