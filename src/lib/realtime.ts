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

export function subscribeToStudentMessages(
  studentId: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel(`messages:student:${studentId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `student_id=eq.${studentId}` },
      (payload) => {
        const record = payload.new as Record<string, unknown>;
        if (!dedupById(channel, record)) {
          onInsert(record);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = err ?? new Error(`Realtime subscription error: ${status}`);
        console.error(`Student message subscription error (${studentId}):`, error);
        onError?.(error);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAdminInbox(
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel('messages:admin-inbox')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender=eq.student` },
      (payload) => {
        const record = payload.new as Record<string, unknown>;
        if (!dedupById(channel, record)) {
          onInsert(record);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = err ?? new Error(`Realtime subscription error: ${status}`);
        console.error('Admin inbox subscription error:', error);
        onError?.(error);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAdminConversation(
  studentId: string,
  onInsert: OnInsertCallback,
  onError?: OnErrorCallback
): () => void {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel(`messages:admin-convo:${studentId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `student_id=eq.${studentId}` },
      (payload) => {
        const record = payload.new as Record<string, unknown>;
        if (!dedupById(channel, record)) {
          onInsert(record);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = err ?? new Error(`Realtime subscription error: ${status}`);
        console.error(`Admin conversation subscription error (${studentId}):`, error);
        onError?.(error);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
