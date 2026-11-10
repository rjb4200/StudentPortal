import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'anon-key';
  process.env.NEXT_PUBLIC_SITE_URL ||= 'https://student-portal.example';
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key';
});
vi.mock('server-only', () => ({}));

import type { ActivityDetail } from '@/lib/first-due/client';
import { cancelLinkedEventForSchedule } from '@/lib/first-due/immediate';

const SCHEDULE_ID = '3f8a1c2e-9b7d-4e6a-8c5f-1d2e3a4b5c6d';
const TOKEN = `SP#${SCHEDULE_ID}`;

function detail(overrides: Partial<ActivityDetail> = {}): ActivityDetail {
  return {
    id: 42,
    name: 'Student Ride — Jane Doe',
    notes: TOKEN,
    startAt: '11/10/2026 07:00:00',
    endAt: '11/10/2026 19:00:00',
    eventTypeId: [11126],
    statusCode: 'incomplete',
    date: '11/10/2026',
    ...overrides,
  };
}

function deps(link: { eventId: number | null; token: string; state: string } | null) {
  const saveLink = vi.fn(async () => {});
  const cancelEvent = vi.fn(async () => ({ id: 42, deleted: true as const }));
  const getActivity = vi.fn(async () => detail());
  return {
    saveLink,
    cancelEvent,
    getActivity,
    repository: {
      getLink: async () => (link ? { ...link, state: link.state as never } : null),
      saveLink,
    },
    client: { getActivity, cancelEvent },
  };
}

describe('cancelLinkedEventForSchedule', () => {
  it('skips when there is no ledger link', async () => {
    const d = deps(null);
    await expect(cancelLinkedEventForSchedule({ id: SCHEDULE_ID, date: '2026-11-10' }, d)).resolves.toBe('skipped');
    expect(d.cancelEvent).not.toHaveBeenCalled();
  });

  it('skips when the link is already cancelled', async () => {
    const d = deps({ eventId: 42, token: TOKEN, state: 'cancelled' });
    await expect(cancelLinkedEventForSchedule({ id: SCHEDULE_ID, date: '2026-11-10' }, d)).resolves.toBe('skipped');
    expect(d.cancelEvent).not.toHaveBeenCalled();
  });

  it('skips when the event can no longer be read', async () => {
    const d = deps({ eventId: 42, token: TOKEN, state: 'posted' });
    d.getActivity.mockRejectedValueOnce(new Error('gone'));
    await expect(cancelLinkedEventForSchedule({ id: SCHEDULE_ID, date: '2026-11-10' }, d)).resolves.toBe('skipped');
    expect(d.cancelEvent).not.toHaveBeenCalled();
  });

  it('cancels and records the ledger state', async () => {
    const d = deps({ eventId: 42, token: TOKEN, state: 'posted' });
    await expect(cancelLinkedEventForSchedule({ id: SCHEDULE_ID, date: '2026-11-10' }, d)).resolves.toBe('cancelled');
    expect(d.cancelEvent).toHaveBeenCalledTimes(1);
    expect(d.saveLink).toHaveBeenCalledWith(
      expect.objectContaining({ scheduleId: SCHEDULE_ID, eventId: 42, state: 'cancelled' })
    );
  });
});
