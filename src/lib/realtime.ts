import { createClient } from '@/lib/supabase/client';

type OnInsertCallback = (message: Record<string, unknown>) => void;
type OnErrorCallback = (error: Error) => void;

function createChannel(
  topic: string,
  filter: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  const supabase = createClient();

  const channel = supabase.channel(topic);

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter },
    (payload) => {
      try {
        const record = (payload as Record<string, unknown>).new as Record<string, unknown>;
        if (record) {
          onInsert(record);
        }
      } catch {}
    }
  );

  channel.subscribe((status, err) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.error(`Realtime error (${topic}):`, err ?? status);
      onError?.(err ?? new Error(String(status)));
    }
  });

  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}

export function subscribeToStudentMessages(
  studentId: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  return createChannel(
    `student-msgs-${studentId}-${Math.random().toString(36).slice(2, 8)}`,
    `student_id=eq.${studentId}`,
    onInsert,
    onError
  );
}

export function subscribeToAdminInbox(
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  return createChannel(
    `admin-inbox-${Math.random().toString(36).slice(2, 8)}`,
    'sender=eq.student',
    onInsert,
    onError
  );
}

export function subscribeToAdminConversation(
  studentId: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  return createChannel(
    `admin-convo-${studentId}-${Math.random().toString(36).slice(2, 8)}`,
    `student_id=eq.${studentId}`,
    onInsert,
    onError
  );
}
