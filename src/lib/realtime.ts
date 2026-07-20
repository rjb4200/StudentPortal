import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type OnInsertCallback = (message: Record<string, unknown>) => void;
type OnErrorCallback = (error: Error) => void;

const seenIds = new WeakMap<RealtimeChannel, Set<string>>();

function dedupById(channel: RealtimeChannel, newRecord: Record<string, unknown>): boolean {
  if (!seenIds.has(channel)) {
    seenIds.set(channel, new Set<string>());
  }
  const ids = seenIds.get(channel)!;
  const id = newRecord.id as string | undefined;
  if (!id || ids.has(id)) return true;
  ids.add(id);
  return false;
}

function createSubscription(
  topic: string,
  filter: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  const supabase = createClient();
  const uniqueTopic = `${topic}:${Math.random().toString(36).slice(2)}`;
  const channel = supabase.channel(uniqueTopic);

  try {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter },
      (payload) => {
        const record = payload.new as Record<string, unknown>;
        if (!dedupById(channel, record)) {
          onInsert(record);
        }
      }
    );

    channel.subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = err ?? new Error(`Realtime subscription error: ${status}`);
        console.error(`Realtime subscription error (${topic}):`, error);
        onError?.(error);
      }
    });
  } catch (e) {
    console.error(`Failed to set up realtime subscription (${topic}):`, e);
    onError?.(e instanceof Error ? e : new Error(String(e)));
  }

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
  return createSubscription(
    `messages:student:${studentId}`,
    `student_id=eq.${studentId}`,
    onInsert,
    onError
  );
}

export function subscribeToAdminInbox(
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  return createSubscription(
    'messages:admin-inbox',
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
  return createSubscription(
    `messages:admin-convo:${studentId}`,
    `student_id=eq.${studentId}`,
    onInsert,
    onError
  );
}
