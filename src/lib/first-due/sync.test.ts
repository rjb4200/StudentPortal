import { describe, expect, it, vi } from 'vitest';
import type { ActivityDetail, FirstDueClient } from '@/lib/first-due/client';
import type { FirstDueAlert, SyncLink, SyncLinkRow, SyncSchedule } from '@/lib/first-due/sync';
import { buildEventInput, runFirstDueSync } from '@/lib/first-due/sync';

const SCHEDULE_ID = '3f8a1c2e-9b7d-4e6a-8c5f-1d2e3a4b5c6d';
const OTHER_ID = '11111111-2222-4333-8444-555555555555';

function schedule(overrides: Partial<SyncSchedule> = {}): SyncSchedule {
  return {
    id: SCHEDULE_ID,
    date: '2026-11-10',
    shift_type: 'day',
    start_time: '7:00 AM',
    end_time: '7:00 PM',
    studentName: 'Jane Doe',
    className: 'EMT 235-26-12B',
    preceptorName: 'R Brown',
    ...overrides,
  };
}

function link(overrides: Partial<SyncLinkRow> = {}): SyncLinkRow {
  return {
    scheduleId: SCHEDULE_ID,
    eventId: 501,
    state: 'verified',
    date: '2026-11-10',
    status: 'approved',
    ...overrides,
  };
}

function detail(id: number, date: string): ActivityDetail {
  return {
    id,
    name: 'Student Ride — Jane Doe',
    notes: 'Student: Jane Doe',
    startAt: '11/10/2026 07:00:00',
    endAt: '11/10/2026 19:00:00',
    eventTypeId: [11126],
    statusCode: 'incomplete',
    date,
  };
}

function makeClient(overrides: Partial<FirstDueClient> = {}): FirstDueClient {
  return {
    canary: async () => {},
    listActivities: async () => [],
    getActivity: async (id: number, date: string) => detail(id, date),
    listTrackedEvents: async () => [],
    createEvent: async () => ({ id: 501, name: '', statusCode: 'incomplete', startAt: '', endAt: '' }),
    updateEvent: async () => ({ id: 501, name: '', statusCode: 'incomplete', startAt: '', endAt: '' }),
    deleteEvent: async () => {},
    cancelEvent: async (item: ActivityDetail) => ({ id: item.id, deleted: true }),
    ...overrides,
  };
}

function makeRepository(schedules: SyncSchedule[] = [], links: SyncLinkRow[] = []) {
  const saves: SyncLink[] = [];
  return {
    saves,
    repository: {
      listApprovedSchedules: async () => schedules,
      listLinks: async () => links,
      getLink: async () => null,
      saveLink: async (saved: SyncLink) => {
        saves.push(saved);
      },
      recordJobRun: async () => {},
    },
  };
}

describe('buildEventInput', () => {
  it('builds the title, times, and human notes without a token', () => {
    const { input, token } = buildEventInput(schedule(), 11126);
    expect(token).toBe(`SP#${SCHEDULE_ID}`);
    expect(input.name).toBe('Student Ride — Jane Doe');
    expect(input.startAt).toBe('11/10/2026 07:00:00');
    expect(input.endAt).toBe('11/10/2026 19:00:00');
    expect(input.eventTypeId).toEqual([11126]);
    expect(input.notes.split('\n')).toEqual([
      'Student: Jane Doe',
      'Class: EMT 235-26-12B',
      'Shift: Day shift 7:00 AM–7:00 PM',
      'Preceptor: R Brown',
    ]);
  });

  it('rolls the end date forward for an overnight shift', () => {
    const { input } = buildEventInput(
      schedule({ shift_type: 'night', start_time: '7:00 PM', end_time: '7:00 AM' }),
      11126
    );
    expect(input.startAt).toBe('11/10/2026 19:00:00');
    expect(input.endAt).toBe('11/11/2026 07:00:00');
  });

  it('falls back to preset times when the schedule has none', () => {
    const { input } = buildEventInput(schedule({ start_time: null, end_time: null }), 11126);
    expect(input.startAt).toBe('11/10/2026 07:00:00');
    expect(input.endAt).toBe('11/10/2026 19:00:00');
  });
});

describe('runFirstDueSync', () => {
  it('does not write in dry run', async () => {
    const createEvent = vi.fn();
    const { repository, saves } = makeRepository([schedule()], []);
    const alerts: FirstDueAlert[] = [];

    const result = await runFirstDueSync({
      client: makeClient({ createEvent }),
      repository,
      notify: async (alert) => {
        alerts.push(alert);
      },
      eventTypeId: 11126,
      dryRun: true,
      now: new Date('2026-11-10T10:00:00Z'),
    });

    expect(result).toMatchObject({ status: 'success', plannedCreates: 1, created: 0 });
    expect(createEvent).not.toHaveBeenCalled();
    expect(saves[0]).toMatchObject({ scheduleId: SCHEDULE_ID, state: 'planned' });
    expect(alerts.map((alert) => alert.kind)).toContain('SUMMARY');
  });

  it('creates and verifies a missing event', async () => {
    const { repository, saves } = makeRepository([schedule()], []);
    const createEvent = vi.fn(async () => ({
      id: 501,
      name: 'Student Ride — Jane Doe',
      statusCode: 'incomplete',
      startAt: '2026-11-10 12:00:00',
      endAt: '2026-11-11 00:00:00',
    }));

    const result = await runFirstDueSync({
      client: makeClient({ createEvent }),
      repository,
      notify: async () => {},
      eventTypeId: 11126,
      dryRun: false,
      now: new Date('2026-11-10T10:00:00Z'),
    });

    expect(result).toMatchObject({ status: 'success', created: 1, verified: 1, drifted: 0 });
    expect(saves.map((saved) => saved.state)).toEqual(['posted', 'verified']);
  });

  it('skips a schedule that already has an event', async () => {
    const createEvent = vi.fn();
    const { repository, saves } = makeRepository([schedule()], [link()]);

    const result = await runFirstDueSync({
      client: makeClient({ createEvent }),
      repository,
      notify: async () => {},
      eventTypeId: 11126,
      dryRun: false,
      now: new Date('2026-11-10T10:00:00Z'),
    });

    expect(createEvent).not.toHaveBeenCalled();
    expect(result).toMatchObject({ created: 0, verified: 1 });
    expect(saves.map((saved) => saved.state)).toEqual(['verified']);
  });

  it('cancels a linked event whose schedule is no longer approved', async () => {
    const cancelEvent = vi.fn(async (item: ActivityDetail) => ({ id: item.id, deleted: true as const }));
    const { repository, saves } = makeRepository(
      [],
      [link({ scheduleId: OTHER_ID, eventId: 77, state: 'posted', status: 'cancelled' })]
    );

    const result = await runFirstDueSync({
      client: makeClient({ cancelEvent }),
      repository,
      notify: async () => {},
      eventTypeId: 11126,
      dryRun: false,
      now: new Date('2026-11-10T10:00:00Z'),
    });

    expect(result.cancelled).toBe(1);
    expect(cancelEvent).toHaveBeenCalledTimes(1);
    expect(saves[0]).toMatchObject({ scheduleId: OTHER_ID, state: 'cancelled' });
  });

  it('marks drift when the event is not observed after write', async () => {
    const { repository, saves } = makeRepository([schedule()], []);
    const alerts: FirstDueAlert[] = [];

    const result = await runFirstDueSync({
      client: makeClient({
        getActivity: async () => {
          throw new Error('gone');
        },
      }),
      repository,
      notify: async (alert) => {
        alerts.push(alert);
      },
      eventTypeId: 11126,
      dryRun: false,
      now: new Date('2026-11-10T10:00:00Z'),
    });

    expect(result.drifted).toBe(1);
    expect(saves.some((saved) => saved.state === 'drifted')).toBe(true);
    expect(alerts.map((alert) => alert.kind)).toContain('DRIFT');
  });

  it('fails closed and alerts when the session is rejected', async () => {
    const error = new Error('unauthorized');
    error.name = 'FirstDueAuthError';
    const alerts: FirstDueAlert[] = [];
    const createEvent = vi.fn();

    const result = await runFirstDueSync({
      client: makeClient({
        canary: async () => {
          throw error;
        },
        createEvent,
      }),
      repository: makeRepository([schedule()], []).repository,
      notify: async (alert) => {
        alerts.push(alert);
      },
      eventTypeId: 11126,
      dryRun: false,
    });

    expect(result).toMatchObject({ status: 'failure', authFailure: true });
    expect(createEvent).not.toHaveBeenCalled();
    expect(alerts.map((alert) => alert.kind)).toContain('AUTH');
  });
});
