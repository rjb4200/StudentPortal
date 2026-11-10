import 'server-only';
import { firstDueEnv } from '@/lib/env.server';
import { parseScheduleToken } from '@/lib/first-due/token';

export const FIRST_DUE_BASE_URL = 'https://sizeup.firstduesizeup.com';

export class FirstDueAuthError extends Error {
  constructor(message = 'First Due session is not authorized.') {
    super(message);
    this.name = 'FirstDueAuthError';
  }
}

export class FirstDueShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirstDueShapeError';
  }
}

export type FirstDueRequest = {
  url: string;
  method: 'GET' | 'POST';
  session: string;
  body?: unknown;
};

export type FirstDueResponse = {
  status: number;
  contentType?: string | null;
  text: string;
};

export type FirstDueTransport = (request: FirstDueRequest) => Promise<FirstDueResponse>;

export type DateWindow = { from: string; to: string };

export type ActivitySummary = {
  id: number;
  name: string;
  module: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
};

export type ActivityDetail = {
  id: number;
  name: string;
  notes: string;
  startAt: string;
  endAt: string;
  eventTypeId: number[];
  statusCode: string;
  date: string;
};

export type TrackedEvent = ActivityDetail & { token: string };

export type EventWriteInput = {
  name: string;
  notes: string;
  startAt: string;
  endAt: string;
  eventTypeId?: number[];
  requireStatusUpdate?: boolean;
  allDay?: boolean;
};

export type SavedEvent = {
  id: number;
  name: string;
  statusCode: string;
  startAt: string;
  endAt: string;
};

export type CancelResult = SavedEvent | { id: number; deleted: true };

export type FirstDueClient = {
  canary: () => Promise<void>;
  listActivities: (window: DateWindow) => Promise<ActivitySummary[]>;
  getActivity: (id: number, date: string) => Promise<ActivityDetail>;
  listTrackedEvents: (window: DateWindow) => Promise<TrackedEvent[]>;
  createEvent: (input: EventWriteInput) => Promise<SavedEvent>;
  updateEvent: (id: number, input: EventWriteInput) => Promise<SavedEvent>;
  deleteEvent: (id: number) => Promise<void>;
  cancelEvent: (detail: ActivityDetail) => Promise<CancelResult>;
};

function calendarMode(from: string, to: string): 'day' | 'week' | 'month' {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'week';
  const days = Math.round((end - start) / 86_400_000) + 1;
  if (days <= 1) return 'day';
  if (days <= 7) return 'week';
  return 'month';
}

function toApiDate(date: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;

  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);
  if (us) return `${us[1].padStart(2, '0')}/${us[2].padStart(2, '0')}/${us[3]}`;

  throw new Error(`Invalid date: ${date}`);
}

function asRecord(value: unknown, what: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new FirstDueShapeError(`Unexpected ${what} shape.`);
  }
  return value as Record<string, unknown>;
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'number')) {
    throw new FirstDueShapeError('Unexpected event_type_id shape.');
  }
  return value;
}

async function defaultTransport(request: FirstDueRequest): Promise<FirstDueResponse> {
  const headers: Record<string, string> = {
    cookie: request.session,
    'x-requested-with': 'XMLHttpRequest',
  };
  if (request.method === 'POST') headers['content-type'] = 'application/json;charset=UTF-8';

  const response = await fetch(request.url, {
    method: request.method,
    headers,
    body: request.method === 'POST' ? JSON.stringify(request.body ?? {}) : undefined,
    cache: 'no-store',
  });

  return {
    status: response.status,
    contentType: response.headers.get('content-type'),
    text: await response.text(),
  };
}

export function createFirstDueClient(options: {
  session: string;
  transport?: FirstDueTransport;
  baseUrl?: string;
}): FirstDueClient {
  const transport = options.transport ?? defaultTransport;
  const baseUrl = (options.baseUrl ?? FIRST_DUE_BASE_URL).replace(/\/+$/, '');

  async function call(path: string, method: 'GET' | 'POST', body?: unknown) {
    const response = await transport({
      url: `${baseUrl}${path}`,
      method,
      session: options.session,
      body,
    });

    if (response.status === 401 || response.status === 403) {
      throw new FirstDueAuthError(`First Due returned ${response.status}.`);
    }
    if (response.contentType && response.contentType.includes('text/html')) {
      throw new FirstDueAuthError('First Due returned a login page.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch {
      throw new FirstDueShapeError('First Due returned a non-JSON response.');
    }
    return asRecord(parsed, 'response');
  }

  async function canary() {
    const payload = await call('/event-log/getEventTypes?pageSize=1&type=all', 'GET');
    if (payload.success !== true || !Array.isArray(payload.event_types)) {
      throw new FirstDueShapeError('Event type response did not match the expected shape.');
    }
  }

  async function listActivities(window: DateWindow) {
    const payload = await call('/event-calendar/getActivities', 'POST', {
      calendar_mode: calendarMode(window.from, window.to),
      date_from: window.from,
      date_to: window.to,
      filters: {
        period: 'other',
        name: '',
        module: ['Event', 'Training', 'NFIRS/EPCR', 'Inspection', 'Asset', 'Work Shift', 'Time Off', 'Daily Log'],
        place_name: '',
        public_name: [],
        units: [],
        status: null,
        time_off_type: [],
        work_type: [],
        event_type_id: [],
        fire_station_id: [],
        batt_dept_shift_id: [],
        created_by: [],
        view: 'calendar',
        date_from: window.from,
        date_to: window.to,
      },
    });

    if (payload.result !== true || !Array.isArray(payload.records)) {
      throw new FirstDueShapeError('Activity list did not match the expected shape.');
    }

    return payload.records.map((raw): ActivitySummary => {
      const record = asRecord(raw, 'activity record');
      if (
        typeof record.id !== 'number' ||
        typeof record.name !== 'string' ||
        typeof record.module !== 'string' ||
        typeof record.activity_date_local !== 'string' ||
        typeof record.activity_time_local !== 'string' ||
        typeof record.activity_date_local_end !== 'string' ||
        typeof record.activity_time_local_end !== 'string'
      ) {
        throw new FirstDueShapeError('Activity record is missing expected fields.');
      }
      return {
        id: record.id,
        name: record.name,
        module: record.module,
        date: record.activity_date_local,
        time: record.activity_time_local,
        endDate: record.activity_date_local_end,
        endTime: record.activity_time_local_end,
      };
    });
  }

  async function getActivity(id: number, date: string) {
    const payload = await call(
      `/event-log/getActivityInfo?id=${id}&module=Event&date=${encodeURIComponent(toApiDate(date))}`,
      'GET'
    );
    if (payload.success !== true) {
      throw new FirstDueShapeError('Activity detail did not match the expected shape.');
    }

    const activity = asRecord(payload.activity, 'activity detail');
    if (
      typeof activity.id !== 'number' ||
      typeof activity.name !== 'string' ||
      typeof activity.notes !== 'string' ||
      typeof activity.start_at !== 'string' ||
      typeof activity.end_at !== 'string' ||
      typeof activity.status_code !== 'string'
    ) {
      throw new FirstDueShapeError('Activity detail is missing expected fields.');
    }

    return {
      id: activity.id,
      name: activity.name,
      notes: activity.notes,
      startAt: activity.start_at,
      endAt: activity.end_at,
      eventTypeId: asNumberArray(activity.event_type_id),
      statusCode: activity.status_code,
      date: typeof activity.date === 'string' ? activity.date : date,
    };
  }

  async function listTrackedEvents(window: DateWindow) {
    const activities = await listActivities(window);
    const tracked: TrackedEvent[] = [];
    for (const activity of activities) {
      if (activity.module !== 'Event') continue;
      const detail = await getActivity(activity.id, activity.date);
      const token = parseScheduleToken(detail.notes);
      if (token) tracked.push({ ...detail, token });
    }
    return tracked;
  }

  function eventPayload(input: EventWriteInput) {
    return {
      name: input.name,
      notes: input.notes,
      start_at: input.startAt,
      end_at: input.endAt,
      event_type_id: input.eventTypeId ?? [],
      require_status_update: input.requireStatusUpdate ?? false,
      allow_clock_in_attendance: false,
      all_day_event: input.allDay ?? false,
      isRecurrentEvent: false,
      is_indefinite: false,
      is_eligible: false,
      young_children_attendees: null,
      school_children_attendees: null,
      adult_attendees: null,
      senior_adult_attendees: null,
      associated_apparatus: [],
      apparatus_department_id: [],
      fire_station_id: [],
      batt_dept_shift_id: [],
      address1: '',
      address2: '',
      city: '',
      state_code: '',
      county_code: '',
      zip: '',
      unit_suite_code: '',
      gps_location: '',
      us_national_grid_coordinates: '',
      location_cache: '',
      attachments: [],
      recurrence: {},
      payrollSummary: [],
    };
  }

  async function saveEvent(input: EventWriteInput, id?: number): Promise<SavedEvent> {
    const event = eventPayload(input);
    const payload = await call('/eventCreationLog/save', 'POST', {
      event_log: id == null ? event : { ...event, id },
    });

    if (payload.result !== true) {
      throw new Error(typeof payload.msg === 'string' ? payload.msg : 'First Due rejected the event save.');
    }

    const data = asRecord(payload.data, 'save response');
    const saved = asRecord(data.event_log, 'saved event');
    if (typeof saved.id !== 'number') {
      throw new FirstDueShapeError('Saved event is missing an id.');
    }

    return {
      id: saved.id,
      name: typeof saved.name === 'string' ? saved.name : input.name,
      statusCode: typeof saved.status_code === 'string' ? saved.status_code : '',
      startAt: typeof saved.start_at === 'string' ? saved.start_at : input.startAt,
      endAt: typeof saved.end_at === 'string' ? saved.end_at : input.endAt,
    };
  }

  async function deleteEvent(id: number) {
    const payload = await call('/event-log/deleteEvent', 'POST', { id });
    if (payload.result !== true) {
      throw new Error(typeof payload.msg === 'string' ? payload.msg : 'First Due rejected the event delete.');
    }
  }

  async function cancelEvent(detail: ActivityDetail): Promise<CancelResult> {
    const name = detail.name.startsWith('[CANCELLED]') ? detail.name : `[CANCELLED] ${detail.name}`;
    try {
      return await saveEvent(
        {
          name,
          notes: detail.notes,
          startAt: detail.startAt,
          endAt: detail.endAt,
          eventTypeId: detail.eventTypeId,
        },
        detail.id
      );
    } catch (error) {
      await deleteEvent(detail.id);
      return { id: detail.id, deleted: true };
    }
  }

  return {
    canary,
    listActivities,
    getActivity,
    listTrackedEvents,
    createEvent: (input) => saveEvent(input),
    updateEvent: (id, input) => saveEvent(input, id),
    deleteEvent,
    cancelEvent,
  };
}

export function getFirstDueClient(transport?: FirstDueTransport): FirstDueClient {
  if (!firstDueEnv.session) {
    throw new Error('FIRST_DUE_SESSION is not configured.');
  }
  return createFirstDueClient({ session: firstDueEnv.session, transport });
}
