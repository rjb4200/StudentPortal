ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS notify_student_messages boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Students can insert own messages" ON public.messages;

CREATE POLICY "Students can insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender = 'student'::message_sender
    AND (select auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.students
      WHERE students.id = messages.student_id
        AND students.auth_user_id = (select auth.uid())
        AND students.status IN ('pending'::student_status, 'certified'::student_status)
        AND students.is_blacklisted = false
    )
  );
