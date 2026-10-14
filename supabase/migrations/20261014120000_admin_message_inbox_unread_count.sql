-- Adds a per-conversation unread student-message count to the admin message inbox,
-- so the admin UI (thread list and Student Roster) can surface a numeric badge.
--
-- The return type changes, so the function must be dropped and recreated.

DROP FUNCTION IF EXISTS public.get_admin_message_inbox(uuid);

CREATE FUNCTION public.get_admin_message_inbox(p_admin_account_id uuid)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  latest_message_text text,
  latest_message_sender message_sender,
  latest_message_at timestamptz,
  latest_student_message_at timestamptz,
  unread_count integer,
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
  ),
  unread_counts AS (
    SELECT
      m.student_id,
      count(*)::integer AS unread_count
    FROM public.messages AS m
    LEFT JOIN public.admin_message_thread_state AS ts
      ON ts.student_id = m.student_id
      AND ts.admin_account_id = p_admin_account_id
    WHERE m.sender = 'student'::message_sender
      AND (ts.last_read_student_message_at IS NULL OR m.created_at > ts.last_read_student_message_at)
    GROUP BY m.student_id
  )
  SELECT
    students.id,
    students.full_name,
    latest_messages.message_text,
    latest_messages.sender,
    latest_messages.created_at,
    latest_student_messages.created_at,
    COALESCE(unread_counts.unread_count, 0),
    latest_student_messages.created_at IS NOT NULL
      AND (
        thread_state.last_read_student_message_at IS NULL
        OR latest_student_messages.created_at > thread_state.last_read_student_message_at
      ),
    latest_messages.sender = 'student'::message_sender
  FROM latest_messages
  JOIN public.students ON students.id = latest_messages.student_id
  LEFT JOIN latest_student_messages ON latest_student_messages.student_id = students.id
  LEFT JOIN unread_counts ON unread_counts.student_id = students.id
  LEFT JOIN public.admin_message_thread_state AS thread_state
    ON thread_state.student_id = students.id
    AND thread_state.admin_account_id = p_admin_account_id;
$$;

REVOKE ALL ON FUNCTION public.get_admin_message_inbox(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_message_inbox(uuid) TO service_role;
