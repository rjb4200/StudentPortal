-- ============================================================
-- WFD EMS Student Portal — Complete Database Migration
-- Run this in the Supabase SQL Editor for project ejjsahtohaydoogtilgp
-- ============================================================

-- 1. ENUM TYPES
CREATE TYPE student_status AS ENUM ('pending', 'certified', 'expired');
CREATE TYPE station_unit AS ENUM ('Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial');
CREATE TYPE shift_type AS ENUM ('full', 'day', 'night');
CREATE TYPE schedule_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE note_priority AS ENUM ('normal', 'high_accessibility');
CREATE TYPE message_sender AS ENUM ('student', 'admin');

-- 2. TABLES

-- 2.1 students
CREATE TABLE students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  school_name text NOT NULL,
  instructor_name text NOT NULL,
  instructor_contact text NOT NULL,
  status student_status NOT NULL DEFAULT 'pending'::student_status,
  access_until timestamptz,
  no_show_count integer NOT NULL DEFAULT 0,
  is_blacklisted boolean NOT NULL DEFAULT false,
  legal_signature text,
  signature_ip text,
  signature_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_email_key UNIQUE (email)
);

CREATE INDEX idx_students_email ON students USING btree (email);
CREATE INDEX idx_students_status ON students USING btree (status);

-- 2.2 preceptors
CREATE TABLE preceptors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  bio text,
  image_url text,
  specialty_tags text[],
  station_unit station_unit,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT preceptors_pkey PRIMARY KEY (id)
);

-- 2.3 schedules
CREATE TABLE schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  date date NOT NULL,
  shift_type shift_type NOT NULL,
  status schedule_status NOT NULL DEFAULT 'pending'::schedule_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_student_date ON schedules USING btree (student_id, date);

-- 2.4 evaluations
CREATE TABLE evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  preceptor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  clinical_rating integer NOT NULL,
  teaching_rating integer NOT NULL,
  safety_rating integer NOT NULL,
  overall_rating integer NOT NULL,
  comments text,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_preceptor_id_fkey FOREIGN KEY (preceptor_id) REFERENCES preceptors(id) ON DELETE CASCADE,
  CONSTRAINT evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT evaluations_clinical_rating_check CHECK (((clinical_rating >= 1) AND (clinical_rating <= 5))),
  CONSTRAINT evaluations_teaching_rating_check CHECK (((teaching_rating >= 1) AND (teaching_rating <= 5))),
  CONSTRAINT evaluations_safety_rating_check CHECK (((safety_rating >= 1) AND (safety_rating <= 5))),
  CONSTRAINT evaluations_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5)))
);

CREATE INDEX idx_evaluations_preceptor ON evaluations USING btree (preceptor_id);
CREATE INDEX idx_evaluations_student ON evaluations USING btree (student_id);

-- 2.5 admin_notes
CREATE TABLE admin_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  note_text text NOT NULL,
  priority note_priority NOT NULL DEFAULT 'normal'::note_priority,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_notes_pkey PRIMARY KEY (id),
  CONSTRAINT admin_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_notes_student ON admin_notes USING btree (student_id);

-- 2.6 messages
CREATE TABLE messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  sender message_sender NOT NULL,
  message_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_student ON messages USING btree (student_id);

-- 2.7 audit_log
CREATE TABLE audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action text NOT NULL,
  performed_by text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);

-- 3. ROW LEVEL SECURITY

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE preceptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 3.1 Student policies: students can only access their own rows

CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow onboarding registration" ON students
  FOR INSERT WITH CHECK (status = 'pending'::student_status);

CREATE POLICY "Allow pending onboarding updates" ON students
  FOR UPDATE
  USING (status = 'pending'::student_status)
  WITH CHECK (status = 'pending'::student_status);

CREATE POLICY "Students can update own record" ON students
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Preceptors visible to all authenticated users" ON preceptors
  FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Students can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own evaluations" ON evaluations
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own evaluations" ON evaluations
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own messages" ON messages
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = student_id AND sender = 'student'::message_sender);

-- 3.2 Admin policies: admins have full access via role metadata check

CREATE POLICY "Admins have full access to students" ON students
  FOR ALL USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage preceptors" ON preceptors
  FOR ALL USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins have full access to schedules" ON schedules
  FOR ALL USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins have full access to evaluations" ON evaluations
  FOR ALL USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins have full access to admin_notes" ON admin_notes
  FOR ALL USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can read all messages" ON messages
  FOR SELECT USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can insert messages" ON messages
  FOR INSERT WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text AND sender = 'admin'::message_sender);

CREATE POLICY "Admins can read audit_log" ON audit_log
  FOR SELECT USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can insert audit_log" ON audit_log
  FOR INSERT WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- 4. Onboarding registration helper
-- Allows pending (any) or expired (not blacklisted) entries to be overwritten by the same email.
CREATE OR REPLACE FUNCTION public.register_onboarding_student(
  p_full_name text,
  p_email text,
  p_phone text,
  p_school_name text,
  p_instructor_name text,
  p_instructor_contact text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_student students%ROWTYPE;
  new_student_id uuid;
BEGIN
  SELECT *
  INTO existing_student
  FROM students
  WHERE lower(email) = lower(p_email)
  LIMIT 1;

  IF FOUND THEN
    IF existing_student.is_blacklisted THEN
      RAISE EXCEPTION 'A student with this email is already registered.'
        USING ERRCODE = '23505';
    END IF;

    IF existing_student.status = 'certified'::student_status THEN
      RAISE EXCEPTION 'A student with this email is already registered.'
        USING ERRCODE = '23505';
    END IF;

    UPDATE students
    SET
      full_name = p_full_name,
      email = p_email,
      phone = NULLIF(p_phone, ''),
      school_name = p_school_name,
      instructor_name = p_instructor_name,
      instructor_contact = p_instructor_contact,
      status = 'pending'::student_status,
      legal_signature = NULL,
      signature_ip = NULL,
      signature_timestamp = NULL,
      no_show_count = 0,
      is_blacklisted = false,
      created_at = now()
    WHERE id = existing_student.id
    RETURNING id INTO new_student_id;

    RETURN new_student_id;
  END IF;

  INSERT INTO students (
    full_name,
    email,
    phone,
    school_name,
    instructor_name,
    instructor_contact,
    status
  ) VALUES (
    p_full_name,
    p_email,
    NULLIF(p_phone, ''),
    p_school_name,
    p_instructor_name,
    p_instructor_contact,
    'pending'::student_status
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_onboarding_student(text, text, text, text, text, text) TO anon, authenticated;
