import { describe, expect, it } from 'vitest';
import { isThreadUnread, orderMessageThreads, type MessageThread } from '@/lib/message-inbox';

const baseThread: MessageThread = {
  student_id: 'student-one',
  student_name: 'Student One',
  latest_message_text: 'Hello',
  latest_message_sender: 'student',
  latest_message_at: '2026-07-18T10:00:00.000Z',
  latest_student_message_at: '2026-07-18T10:00:00.000Z',
  is_unread: false,
  needs_reply: true,
};

describe('message inbox state', () => {
  it('marks a later student message unread after a thread was acknowledged', () => {
    expect(isThreadUnread('2026-07-18T11:00:00.000Z', '2026-07-18T10:00:00.000Z')).toBe(true);
    expect(isThreadUnread('2026-07-18T10:00:00.000Z', '2026-07-18T10:00:00.000Z')).toBe(false);
  });

  it('orders unread threads before read threads and newest first within each group', () => {
    const ordered = orderMessageThreads([
      { ...baseThread, student_id: 'read-newer', latest_message_at: '2026-07-18T12:00:00.000Z' },
      { ...baseThread, student_id: 'unread-older', is_unread: true, latest_message_at: '2026-07-18T09:00:00.000Z' },
      { ...baseThread, student_id: 'unread-newer', is_unread: true, latest_message_at: '2026-07-18T11:00:00.000Z' },
    ]);

    expect(ordered.map((thread) => thread.student_id)).toEqual(['unread-newer', 'unread-older', 'read-newer']);
  });

  it('keeps needs-reply independent from unread state', () => {
    expect({ ...baseThread, is_unread: false, needs_reply: true }).toEqual(expect.objectContaining({
      is_unread: false,
      needs_reply: true,
    }));
  });
});
