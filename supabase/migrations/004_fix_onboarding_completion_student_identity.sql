-- ============================================================
-- Preserve student enrollment identity during auth linking
-- ============================================================

ALTER TYPE student_status ADD VALUE IF NOT EXISTS 'archived';

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS auth_user_id uuid,
  ADD COLUMN IF NOT EXISTS previous_student_id uuid,
  ADD COLUMN IF NOT EXISTS is_test_record boolean NOT NULL DEFAULT false;

ALTER TABLE students
  DROP CONSTRAINT IF EXISTS students_email_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'students'
      AND constraint_name = 'students_auth_user_id_fkey'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'students'
      AND constraint_name = 'students_previous_student_id_fkey'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_previous_student_id_fkey
      FOREIGN KEY (previous_student_id) REFERENCES students(id) ON DELETE SET NULL;
  END IF;

END $$;

CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_previous_student_id ON students (previous_student_id);
CREATE INDEX IF NOT EXISTS idx_students_email_lower ON students (lower(email));
CREATE INDEX IF NOT EXISTS idx_students_email_status ON students (lower(email), status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_test_email ON students (lower(email), is_test_record);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_active_auth_user_id
  ON students (auth_user_id)
  WHERE auth_user_id IS NOT NULL AND status::text IN ('pending', 'certified');

UPDATE students s
SET auth_user_id = u.id
FROM auth.users u
WHERE s.auth_user_id IS NULL
  AND lower(s.email) = lower(u.email)
  AND NOT EXISTS (
    SELECT 1
    FROM students other
    WHERE other.auth_user_id = u.id
      AND other.id <> s.id
  );

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
  prior_student students%ROWTYPE;
  new_student_id uuid;
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
    is_test_record
  ) VALUES (
    p_full_name,
    p_email,
    NULLIF(p_phone, ''),
    p_school_name,
    p_instructor_name,
    p_instructor_contact,
    'pending'::student_status,
    CASE WHEN FOUND THEN prior_student.id ELSE NULL END,
    false
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_onboarding_student(text, text, text, text, text, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Students can view own record" ON students;
DROP POLICY IF EXISTS "Students can update own record" ON students;
DROP POLICY IF EXISTS "Allow onboarding registration" ON students;
DROP POLICY IF EXISTS "Allow pending onboarding updates" ON students;
DROP POLICY IF EXISTS "Students can view own schedules" ON schedules;
DROP POLICY IF EXISTS "Students can insert own schedules" ON schedules;
DROP POLICY IF EXISTS "Students can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Students can insert own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Students can view own messages" ON messages;
DROP POLICY IF EXISTS "Students can insert own messages" ON messages;
DROP POLICY IF EXISTS "Students can read own field values" ON student_field_values;

CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow onboarding registration" ON students
  FOR INSERT WITH CHECK (status = 'pending'::student_status AND is_test_record = false);

CREATE POLICY "Allow pending onboarding updates" ON students
  FOR UPDATE
  USING (status = 'pending'::student_status)
  WITH CHECK (status = 'pending'::student_status AND is_test_record = false);

CREATE POLICY "Students can update own record" ON students
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Students can view own schedules" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
        AND students.auth_user_id = auth.uid()
        AND students.status = 'certified'::student_status
        AND students.is_blacklisted = false
    )
  );

CREATE POLICY "Students can view own evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = evaluations.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own evaluations" ON evaluations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = evaluations.student_id
        AND students.auth_user_id = auth.uid()
        AND students.status = 'certified'::student_status
        AND students.is_blacklisted = false
    )
  );

CREATE POLICY "Students can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    sender = 'student'::message_sender
    AND EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.auth_user_id = auth.uid()
        AND students.status = 'certified'::student_status
        AND students.is_blacklisted = false
    )
  );

CREATE POLICY "Students can read own field values" ON student_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_field_values.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow onboarding field value inserts" ON student_field_values
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_field_values.student_id
        AND students.status = 'pending'::student_status
        AND students.auth_user_id IS NULL
        AND students.is_test_record = false
    )
  );
