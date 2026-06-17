-- 009_shift_cancellation
-- Add cancelled status and cancel note to schedules, add student cancel RLS policy

ALTER TYPE schedule_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS cancel_note text;

DROP POLICY IF EXISTS "Students can cancel own schedules" ON schedules;

CREATE POLICY "Students can cancel own schedules" ON schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
        AND students.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (status = 'cancelled'::schedule_status);
