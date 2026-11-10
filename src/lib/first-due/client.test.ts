import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key';
});
vi.mock('server-only', () => ({}));

import {
  FirstDueAuthError,
  FirstDueShapeError,
  createFirstDueClient,
  type FirstDueRequest,
  type FirstDueResponse,
} from '@/lib/first-due/client';

const TOKEN_A = 'SP#3f8a1c2e-9b7d-4e6a-8c5f-1d2e3a4b5c6d';

function json(value: unknown, status = 200): FirstDueResponse {
  return { status, contentType: 'application/json', text: JSON.stringify(value) };
}

function record(id: number, module = 'Event'): Record<string, unknown> {
  return {
    id,
    name: `Event ${id}`,
    module,
    color: '#2196f3',
    activity_date_local: '11/10/2026',
    activity_time_local: '07:00',
    activity_date_local_end: '11/10/2026',
    activity_time_local_end: '08:00',
  };
}

describe('canary', () => {
  it('passes on a healthy event-type response', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => json({ success: true, event_types: [{ id: 11126 }] }),
    });
    await expect(client.canary()).resolves.toBeUndefined();
  });

  it('fails closed on 401 and 403', async () => {
    for (const status of [401, 403]) {
      const client = createFirstDueClient({
        session: 'session',
        transport: async () => json({}, status),
      });
      await expect(client.canary()).rejects.toBeInstanceOf(FirstDueAuthError);
    }
  });

  it('fails closed when a login page is returned', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => ({ status: 200, contentType: 'text/html; charset=utf-8', text: '<html>Sign in</html>' }),
    });
    await expect(client.canary()).rejects.toBeInstanceOf(FirstDueAuthError);
  });

  it('raises a shape error when the payload changes', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => json({ success: true, event_types: 'nope' }),
    });
    await expect(client.canary()).rejects.toBeInstanceOf(FirstDueShapeError);
  });
});

describe('listActivities', () => {
  it('posts the calendar filter and maps records', async () => {
    let captured: FirstDueRequest | undefined;
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        captured = request;
        return json({ result: true, msg: '', records: [record(1)] });
      },
    });

    const activities = await client.listActivities({ from: '2026-11-10', to: '2026-11-11' });

    expect(captured?.method).toBe('POST');
    expect(captured?.url).toBe('https://sizeup.firstduesizeup.com/event-calendar/getActivities');
    expect(captured?.session).toBe('session');
    expect(captured?.body).toMatchObject({ date_from: '2026-11-10', date_to: '2026-11-11' });
    expect(activities).toEqual([
      {
        id: 1,
        name: 'Event 1',
        module: 'Event',
        date: '11/10/2026',
        time: '07:00',
        endDate: '11/10/2026',
        endTime: '08:00',
      },
    ]);
  });

  it('returns an empty list for an empty window', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => json({ result: true, records: [] }),
    });
    await expect(client.listActivities({ from: '2026-11-10', to: '2026-11-11' })).resolves.toEqual([]);
  });

  it('raises a shape error on a malformed record', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => json({ result: true, records: [{ id: 'one' }] }),
    });
    await expect(client.listActivities({ from: '2026-11-10', to: '2026-11-11' })).rejects.toBeInstanceOf(
      FirstDueShapeError
    );
  });
});

describe('getActivity', () => {
  it('requests the detail with an encoded date and parses notes', async () => {
    let captured: FirstDueRequest | undefined;
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        captured = request;
        return json({
          success: true,
          activity: {
            id: 7,
            name: 'Ride',
            notes: TOKEN_A,
            start_at: '11/10/2026 07:00:00',
            end_at: '11/10/2026 08:00:00',
            event_type_id: [11126],
            status_code: 'incomplete',
            date: '11/10/2026',
          },
        });
      },
    });

    const detail = await client.getActivity(7, '2026-11-10');

    expect(captured?.method).toBe('GET');
    expect(captured?.url).toContain('/event-log/getActivityInfo?id=7');
    expect(captured?.url).toContain('date=11%2F10%2F2026');
    expect(detail).toMatchObject({ id: 7, notes: TOKEN_A, eventTypeId: [11126], statusCode: 'incomplete' });
  });

  it('returns an empty activity as a shape error', async () => {
    const client = createFirstDueClient({
      session: 'session',
      transport: async () => json({ success: true, activity: {} }),
    });
    await expect(client.getActivity(7, '2026-11-10')).rejects.toBeInstanceOf(FirstDueShapeError);
  });
});

describe('listTrackedEvents', () => {
  it('extracts tokens from Event details and skips untracked and non-Event records', async () => {
    const requested: string[] = [];
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        requested.push(request.url);
        if (request.url.includes('/event-calendar/getActivities')) {
          return json({ result: true, records: [record(1), record(2), record(3, 'Work Shift')] });
        }
        const id = Number(new URL(request.url).searchParams.get('id'));
        return json({
          success: true,
          activity: {
            id,
            name: `Event ${id}`,
            notes: id === 1 ? TOKEN_A : 'no token here',
            start_at: '11/10/2026 07:00:00',
            end_at: '11/10/2026 08:00:00',
            event_type_id: [11126],
            status_code: 'incomplete',
            date: '11/10/2026',
          },
        });
      },
    });

    const tracked = await client.listTrackedEvents({ from: '2026-11-10', to: '2026-11-11' });

    expect(tracked).toHaveLength(1);
    expect(tracked[0]).toMatchObject({ id: 1, token: TOKEN_A.slice(3) });
    expect(requested.some((url) => url.includes('id=3'))).toBe(false);
  });

  it('normalizes non-padded dates from the list projection', async () => {
    const requested: string[] = [];
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        requested.push(request.url);
        return json({
          success: true,
          activity: {
            id: 9,
            name: 'Event 9',
            notes: TOKEN_A,
            start_at: '11/1/2026 07:00:00',
            end_at: '11/1/2026 19:00:00',
            event_type_id: [11126],
            status_code: 'incomplete',
            date: '11/1/2026',
          },
        });
      },
    });

    await client.getActivity(9, '11/1/2026');

    expect(requested[0]).toContain('date=11%2F01%2F2026');
  });
});
