-- Migration 021: Instructor registry, training sites, and class date windows
-- Adds approved registry records, class-linked students, and server-side schedule window enforcement.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registry_status') THEN
    CREATE TYPE public.registry_status AS ENUM ('pending', 'active', 'rejected', 'suspended', 'archived');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.training_sites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  main_phone text,
  status public.registry_status NOT NULL DEFAULT 'pending'::public.registry_status,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_sites_pkey PRIMARY KEY (id),
  CONSTRAINT training_sites_zip_code_length CHECK (length(zip_code) <= 20),
  CONSTRAINT training_sites_main_phone_length CHECK (main_phone IS NULL OR length(main_phone) <= 30)
);

CREATE TABLE IF NOT EXISTS public.instructors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_site_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  mobile_phone text NOT NULL,
  business_phone text,
  credentials text NOT NULL,
  title text NOT NULL,
  preferred_contact_method text NOT NULL,
  preferred_contact_hours text NOT NULL,
  contact_instructions text,
  status public.registry_status NOT NULL DEFAULT 'pending'::public.registry_status,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT instructors_pkey PRIMARY KEY (id),
  CONSTRAINT instructors_training_site_id_fkey FOREIGN KEY (training_site_id) REFERENCES public.training_sites(id) ON DELETE SET NULL,
  CONSTRAINT instructors_mobile_phone_length CHECK (length(mobile_phone) <= 30),
  CONSTRAINT instructors_business_phone_length CHECK (business_phone IS NULL OR length(business_phone) <= 30)
);

CREATE TABLE IF NOT EXISTS public.training_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_site_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  name text NOT NULL,
  class_start_date date NOT NULL,
  ride_time_end_date date NOT NULL,
  notes text,
  status public.registry_status NOT NULL DEFAULT 'pending'::public.registry_status,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_classes_pkey PRIMARY KEY (id),
  CONSTRAINT training_classes_training_site_id_fkey FOREIGN KEY (training_site_id) REFERENCES public.training_sites(id) ON DELETE RESTRICT,
  CONSTRAINT training_classes_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE RESTRICT,
  CONSTRAINT training_classes_date_range_check CHECK (ride_time_end_date >= class_start_date)
);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS training_site_id uuid,
  ADD COLUMN IF NOT EXISTS instructor_id uuid,
  ADD COLUMN IF NOT EXISTS training_class_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'students'
      AND constraint_name = 'students_training_site_id_fkey'
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_training_site_id_fkey
      FOREIGN KEY (training_site_id) REFERENCES public.training_sites(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'students'
      AND constraint_name = 'students_instructor_id_fkey'
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_instructor_id_fkey
      FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'students'
      AND constraint_name = 'students_training_class_id_fkey'
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_training_class_id_fkey
      FOREIGN KEY (training_class_id) REFERENCES public.training_classes(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_training_sites_status ON public.training_sites (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_sites_name ON public.training_sites (name);
CREATE INDEX IF NOT EXISTS idx_instructors_status ON public.instructors (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instructors_training_site ON public.instructors (training_site_id);
CREATE INDEX IF NOT EXISTS idx_instructors_email_lower ON public.instructors (lower(email));
CREATE INDEX IF NOT EXISTS idx_training_classes_status_window ON public.training_classes (status, class_start_date, ride_time_end_date);
CREATE INDEX IF NOT EXISTS idx_training_classes_site ON public.training_classes (training_site_id);
CREATE INDEX IF NOT EXISTS idx_training_classes_instructor ON public.training_classes (instructor_id);
CREATE INDEX IF NOT EXISTS idx_students_training_class ON public.students (training_class_id);
CREATE INDEX IF NOT EXISTS idx_students_training_site ON public.students (training_site_id);
CREATE INDEX IF NOT EXISTS idx_students_instructor ON public.students (instructor_id);

ALTER TABLE public.training_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage training sites" ON public.training_sites;
DROP POLICY IF EXISTS "Admins can manage instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admins can manage training classes" ON public.training_classes;
DROP POLICY IF EXISTS "Public can read active visible training sites" ON public.training_sites;
DROP POLICY IF EXISTS "Public can read active visible instructors" ON public.instructors;
DROP POLICY IF EXISTS "Public can read active visible training classes" ON public.training_classes;

CREATE POLICY "Admins can manage training sites" ON public.training_sites
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage instructors" ON public.instructors
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage training classes" ON public.training_classes
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Public can read active visible training classes" ON public.training_classes
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'::public.registry_status
    AND (timezone('America/New_York'::text, now()))::date BETWEEN class_start_date AND ride_time_end_date
    AND EXISTS (
      SELECT 1 FROM public.training_sites
      WHERE training_sites.id = training_classes.training_site_id
        AND training_sites.status = 'active'::public.registry_status
    )
    AND EXISTS (
      SELECT 1 FROM public.instructors
      WHERE instructors.id = training_classes.instructor_id
        AND instructors.status = 'active'::public.registry_status
    )
  );

CREATE POLICY "Public can read active visible training sites" ON public.training_sites
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'::public.registry_status
    AND EXISTS (
      SELECT 1 FROM public.training_classes
      JOIN public.instructors ON instructors.id = training_classes.instructor_id
      WHERE training_classes.training_site_id = training_sites.id
        AND training_classes.status = 'active'::public.registry_status
        AND instructors.status = 'active'::public.registry_status
        AND (timezone('America/New_York'::text, now()))::date BETWEEN training_classes.class_start_date AND training_classes.ride_time_end_date
    )
  );

CREATE POLICY "Public can read active visible instructors" ON public.instructors
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'::public.registry_status
    AND EXISTS (
      SELECT 1 FROM public.training_classes
      JOIN public.training_sites ON training_sites.id = training_classes.training_site_id
      WHERE training_classes.instructor_id = instructors.id
        AND training_classes.status = 'active'::public.registry_status
        AND training_sites.status = 'active'::public.registry_status
        AND (timezone('America/New_York'::text, now()))::date BETWEEN training_classes.class_start_date AND training_classes.ride_time_end_date
    )
  );

GRANT SELECT ON public.training_sites TO anon, authenticated;
GRANT SELECT ON public.instructors TO anon, authenticated;
GRANT SELECT ON public.training_classes TO anon, authenticated;
GRANT ALL ON public.training_sites TO authenticated;
GRANT ALL ON public.instructors TO authenticated;
GRANT ALL ON public.training_classes TO authenticated;

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
    AND status::text IN ('expired', 'archived')
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

CREATE OR REPLACE FUNCTION public.enforce_student_schedule_class_window()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  class_window record;
BEGIN
  SELECT
    training_classes.class_start_date,
    training_classes.ride_time_end_date
  INTO class_window
  FROM students
  LEFT JOIN training_classes ON training_classes.id = students.training_class_id
  WHERE students.id = NEW.student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student record was not found for schedule request.';
  END IF;

  IF class_window.class_start_date IS NULL OR class_window.ride_time_end_date IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.date < class_window.class_start_date OR NEW.date > class_window.ride_time_end_date THEN
    RAISE EXCEPTION 'Schedule date is outside the selected class date window.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_student_schedule_class_window() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_student_schedule_class_window() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_student_schedule_class_window() FROM authenticated;

DROP TRIGGER IF EXISTS enforce_student_schedule_class_window ON public.schedules;
CREATE TRIGGER enforce_student_schedule_class_window
  BEFORE INSERT OR UPDATE OF date, student_id ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_student_schedule_class_window();

COMMENT ON TABLE public.training_sites IS 'Admin-reviewed training site registry used by class-based onboarding.';
COMMENT ON TABLE public.instructors IS 'Admin-reviewed instructor registry used by class-based onboarding.';
COMMENT ON TABLE public.training_classes IS 'Admin-reviewed training classes with date windows for onboarding visibility and scheduling.';
COMMENT ON COLUMN public.students.training_class_id IS 'Selected approved training class for class-linked onboarding students.';
