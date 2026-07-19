CREATE TABLE public.admin_message_thread_state (
  admin_account_id uuid NOT NULL REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  last_read_student_message_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (admin_account_id, student_id)
);

CREATE INDEX admin_message_thread_state_student_id_idx
  ON public.admin_message_thread_state (student_id);

ALTER TABLE public.admin_message_thread_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_message_thread_state FROM anon, authenticated;
GRANT ALL ON public.admin_message_thread_state TO service_role;

CREATE POLICY "Admins manage own message thread state"
  ON public.admin_message_thread_state
  FOR ALL TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    AND admin_account_id = (
      SELECT id
      FROM public.admin_accounts
      WHERE auth_user_id = (select auth.uid())
        AND is_active = true
    )
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    AND admin_account_id = (
      SELECT id
      FROM public.admin_accounts
      WHERE auth_user_id = (select auth.uid())
        AND is_active = true
    )
  );

CREATE OR REPLACE FUNCTION public.get_admin_message_inbox(p_admin_account_id uuid)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  latest_message_text text,
  latest_message_sender message_sender,
  latest_message_at timestamptz,
  latest_student_message_at timestamptz,
  is_unread boolean,
  needs_reply boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH latest_messages AS (
    SELECT DISTINCT ON (student_id)
      student_id,
      message_text,
      sender,
      created_at
    FROM public.messages
    ORDER BY student_id, created_at DESC, id DESC
  ),
  latest_student_messages AS (
    SELECT student_id, max(created_at) AS created_at
    FROM public.messages
    WHERE sender = 'student'::message_sender
    GROUP BY student_id
  )
  SELECT
    students.id,
    students.full_name,
    latest_messages.message_text,
    latest_messages.sender,
    latest_messages.created_at,
    latest_student_messages.created_at,
    latest_student_messages.created_at IS NOT NULL
      AND (
        thread_state.last_read_student_message_at IS NULL
        OR latest_student_messages.created_at > thread_state.last_read_student_message_at
      ),
    latest_messages.sender = 'student'::message_sender
  FROM latest_messages
  JOIN public.students ON students.id = latest_messages.student_id
  LEFT JOIN latest_student_messages ON latest_student_messages.student_id = students.id
  LEFT JOIN public.admin_message_thread_state AS thread_state
    ON thread_state.student_id = students.id
    AND thread_state.admin_account_id = p_admin_account_id;
$$;

REVOKE ALL ON FUNCTION public.get_admin_message_inbox(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_message_inbox(uuid) TO service_role;
