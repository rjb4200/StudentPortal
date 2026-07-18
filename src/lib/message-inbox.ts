export type MessageThread = {
  student_id: string;
  student_name: string;
  latest_message_text: string;
  latest_message_sender: 'student' | 'admin';
  latest_message_at: string;
  latest_student_message_at: string | null;
  is_unread: boolean;
  needs_reply: boolean;
};

export function isThreadUnread(latestStudentMessageAt: string | null, lastReadStudentMessageAt: string | null) {
  return !!latestStudentMessageAt && (!lastReadStudentMessageAt || latestStudentMessageAt > lastReadStudentMessageAt);
}

export function orderMessageThreads(threads: MessageThread[]) {
  return [...threads].sort((a, b) => {
    if (a.is_unread !== b.is_unread) return a.is_unread ? -1 : 1;
    return new Date(b.latest_message_at).getTime() - new Date(a.latest_message_at).getTime();
  });
}
