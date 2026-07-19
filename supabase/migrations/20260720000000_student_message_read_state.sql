-- Adds read tracking for students (see admin_message_thread_state for admin equivalent)
-- One row per student tracking when they last read admin replies

CREATE TABLE IF NOT EXISTS public.student_message_read_state (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  last_read_admin_message_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_message_read_state ENABLE ROW LEVEL SECURITY;

-- Allow students to read their own read state
CREATE POLICY "Students can read own read state"
  ON public.student_message_read_state
  FOR SELECT
  USING (auth.uid() = student_id);

-- Allow students to upsert their own read state
CREATE POLICY "Students can upsert own read state"
  ON public.student_message_read_state
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own read state"
  ON public.student_message_read_state
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Service role bypass (for admin client operations)
CREATE POLICY "Service role can manage student read state"
  ON public.student_message_read_state
  FOR ALL
  USING (true)
  WITH CHECK (true);
