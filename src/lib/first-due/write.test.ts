import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key';
});
vi.mock('server-only', () => ({}));

import { createFirstDueClient, type FirstDueRequest, type FirstDueResponse } from '@/lib/first-due/client';

const TOKEN = 'SP#3f8a1c2e-9b7d-4e6a-8c5f-1d2e3a4b5c6d';

function saved(id: number, name: string): FirstDueResponse {
  return {
    status: 200,
    contentType: 'application/json',
    text: JSON.stringify({
      result: true,
      msg: 'Event saved successfully.',
      data: { event_log: { id, name, status_code: 'incomplete', start_at: '2026-11-10 12:00:00' } },
    }),
  };
}

describe('createEvent', () => {
  it('posts the full event payload', async () => {
    let captured: FirstDueRequest | undefined;
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        captured = request;
        return saved(501, 'Student Ride — Jane Doe');
      },
    });

    const result = await client.createEvent({
      name: 'Student Ride — Jane Doe',
      notes: TOKEN,
      startAt: '11/10/2026 07:00:00',
      endAt: '11/10/2026 19:00:00',
      eventTypeId: [11126],
    });

    expect(result.id).toBe(501);
    expect(captured?.method).toBe('POST');
    expect(captured?.url).toBe('https://sizeup.firstduesizeup.com/eventCreationLog/save');
    expect(captured?.body).toMatchObject({
      event_log: {
        name: 'Student Ride — Jane Doe',
        notes: TOKEN,
        start_at: '11/10/2026 07:00:00',
        end_at: '11/10/2026 19:00:00',
        event_type_id: [11126],
        all_day_event: false,
      },
    });
  });
});

describe('cancelEvent', () => {
  it('prefixes the title and leaves the token untouched', async () => {
    const requests: FirstDueRequest[] = [];
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        requests.push(request);
        return saved(77, '[CANCELLED] Student Ride — Jane Doe');
      },
    });

    await client.cancelEvent({
      id: 77,
      name: 'Student Ride — Jane Doe',
      notes: TOKEN,
      startAt: '11/10/2026 07:00:00',
      endAt: '11/10/2026 19:00:00',
      eventTypeId: [11126],
      statusCode: 'incomplete',
      date: '11/10/2026',
    });

    const body = requests[0].body as { event_log: Record<string, unknown> };
    expect(body.event_log).toMatchObject({ id: 77, name: '[CANCELLED] Student Ride — Jane Doe', notes: TOKEN });
  });

  it('falls back to deletion when the title cannot be saved', async () => {
    const requests: FirstDueRequest[] = [];
    const client = createFirstDueClient({
      session: 'session',
      transport: async (request) => {
        requests.push(request);
        if (request.url.endsWith('/event-log/deleteEvent')) {
          return {
            status: 200,
            contentType: 'application/json',
            text: JSON.stringify({ result: true, msg: 'Event has been deleted successfully!' }),
          };
        }
        return {
          status: 200,
          contentType: 'application/json',
          text: JSON.stringify({ result: false, msg: 'locked' }),
        };
      },
    });

    const result = await client.cancelEvent({
      id: 88,
      name: 'Student Ride — Jane Doe',
      notes: TOKEN,
      startAt: '11/10/2026 07:00:00',
      endAt: '11/10/2026 19:00:00',
      eventTypeId: [11126],
      statusCode: 'incomplete',
      date: '11/10/2026',
    });

    expect(result).toEqual({ id: 88, deleted: true });
    expect(requests.map((request) => request.url.split('/').pop())).toEqual(['save', 'deleteEvent']);
  });
});
