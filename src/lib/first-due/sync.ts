import {
  type EventWriteInput,
  type FirstDueClient,
} from '@/lib/first-due/client';
import { buildScheduleToken } from '@/lib/first-due/token';
import {
  formatEasternDateTime,
  getEasternDateSpan,
  normalizeClockTime,
} from '@/lib/first-due/time';

export type LinkState = 'planned' | 'posted' | 'verified' | 'cancelled' | 'drifted';

export type SyncSchedule = {
  id: string;
  date: string;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
  studentName: string;
  className: string | null;
  preceptorName: string | null;
};

export type SyncLink = {
  scheduleId: string;
  token: string;
  eventId?: number | null;
  state: LinkState;
  error?: string | null;
};

export type SyncLinkRow = {
  scheduleId: string;
  eventId: number | null;
  state: LinkState;
  date: string;
  status: string;
};

export type FirstDueRepository = {
  listApprovedSchedules: (from: string, to: string) => Promise<SyncSchedule[]>;
  listLinks: (from: string, to: string) => Promise<SyncLinkRow[]>;
  getLink: (scheduleId: string) => Promise<{ eventId: number | null; token: string; state: LinkState } | null>;
  saveLink: (link: SyncLink) => Promise<void>;
  recordJobRun: (run: {
    status: 'success' | 'failure';
    startedAt: Date;
    finishedAt: Date;
    summary?: Record<string, unknown>;
    errorMessage?: string;
  }) => Promise<void>;
};

export type FirstDueAlert = {
  kind: 'AUTH' | 'DRIFT' | 'SUMMARY';
  subject: string;
  lines: string[];
};

export type Notify = (alert: FirstDueAlert) => Promise<unknown>;

export type SyncResult = {
  status: 'success' | 'failure';
  window: { from: string; to: string };
  dryRun: boolean;
  plannedCreates: number;
  created: number;
  cancelled: number;
  verified: number;
  drifted: number;
  authFailure: boolean;
  error?: string;
};

const PRESET_TIMES: Record<string, { start: string; end: string }> = {
  full: { start: '07:00', end: '22:00' },
  day: { start: '07:00', end: '19:00' },
  night: { start: '19:00', end: '07:00' },
};

const SHIFT_LABELS: Record<string, string> = {
  full: 'Full shift',
  day: 'Day shift',
  night: 'Night shift',
  custom: 'Custom shift',
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function addDays(date: string, days: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  const next = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function minutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function buildEventInput(
  schedule: SyncSchedule,
  eventTypeId: number
): { input: EventWriteInput; token: string } {
  const preset = PRESET_TIMES[schedule.shift_type];
  const start = normalizeClockTime(schedule.start_time || preset?.start || '07:00');
  const end = normalizeClockTime(schedule.end_time || preset?.end || '19:00');
  const endDate = minutes(end) <= minutes(start) ? addDays(schedule.date, 1) : schedule.date;

  const token = buildScheduleToken(schedule.id);
  const label = SHIFT_LABELS[schedule.shift_type] ?? schedule.shift_type;
  const displayStart = schedule.start_time || preset?.start || '07:00';
  const displayEnd = schedule.end_time || preset?.end || '19:00';

  const notes = [
    `Student: ${schedule.studentName}`,
    ...(schedule.className ? [`Class: ${schedule.className}`] : []),
    `Shift: ${label} ${displayStart}–${displayEnd}`,
    ...(schedule.preceptorName ? [`Preceptor: ${schedule.preceptorName}`] : []),
  ].join('\n');

  return {
    token,
    input: {
      name: `Student Ride — ${schedule.studentName}`,
      notes,
      startAt: formatEasternDateTime(schedule.date, start),
      endAt: formatEasternDateTime(endDate, end),
      eventTypeId: [eventTypeId],
    },
  };
}

async function withRetry<T>(action: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function safeNotify(notify: Notify, alert: FirstDueAlert) {
  try {
    await notify(alert);
  } catch (error) {
    console.error(`First Due ${alert.kind} alert failed:`, error instanceof Error ? error.message : error);
  }
}

export async function runFirstDueSync(options: {
  client: FirstDueClient;
  repository: FirstDueRepository;
  notify: Notify;
  eventTypeId: number;
  dryRun: boolean;
  windowDays?: number;
  now?: Date;
}): Promise<SyncResult> {
  const now = options.now ?? new Date();
  const window = getEasternDateSpan(options.windowDays ?? 5, now);
  const result: SyncResult = {
    status: 'success',
    window: { from: window.from, to: window.to },
    dryRun: options.dryRun,
    plannedCreates: 0,
    created: 0,
    cancelled: 0,
    verified: 0,
    drifted: 0,
    authFailure: false,
  };

  try {
    await options.client.canary();

    const schedules = await options.repository.listApprovedSchedules(window.from, window.to);
    const links = await options.repository.listLinks(window.from, window.to);
    const expected = new Set(schedules.map((schedule) => schedule.id));
    const linkBySchedule = new Map(links.map((link) => [link.scheduleId, link]));

    for (const schedule of schedules) {
      const link = linkBySchedule.get(schedule.id);
      if (link?.eventId != null && link.state !== 'cancelled') continue;

      result.plannedCreates += 1;
      const { input, token } = buildEventInput(schedule, options.eventTypeId);

      if (options.dryRun) {
        await options.repository.saveLink({ scheduleId: schedule.id, token, state: 'planned' });
        continue;
      }

      const saved = await withRetry(() => options.client.createEvent(input));
      await options.repository.saveLink({
        scheduleId: schedule.id,
        token,
        eventId: saved.id,
        state: 'posted',
      });
      linkBySchedule.set(schedule.id, {
        scheduleId: schedule.id,
        eventId: saved.id,
        state: 'posted',
        date: schedule.date,
        status: 'approved',
      });
      result.created += 1;
    }

    for (const link of links) {
      if (link.eventId == null || link.state === 'cancelled') continue;
      if (expected.has(link.scheduleId) || link.status === 'approved') continue;
      if (options.dryRun) continue;

      try {
        const detail = await options.client.getActivity(link.eventId, link.date);
        await withRetry(() => options.client.cancelEvent(detail));
        await options.repository.saveLink({
          scheduleId: link.scheduleId,
          token: buildScheduleToken(link.scheduleId),
          eventId: link.eventId,
          state: 'cancelled',
        });
        result.cancelled += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Cancellation failed';
        await options.repository.saveLink({
          scheduleId: link.scheduleId,
          token: buildScheduleToken(link.scheduleId),
          eventId: link.eventId,
          state: 'drifted',
          error: message,
        });
        result.drifted += 1;
      }
    }

    if (!options.dryRun) {
      const drifted: string[] = [];
      for (const schedule of schedules) {
        const link = linkBySchedule.get(schedule.id);
        if (!link?.eventId) continue;

        try {
          const detail = await options.client.getActivity(link.eventId, schedule.date);
          if (detail.id !== link.eventId) throw new Error('Event id mismatch');
          await options.repository.saveLink({
            scheduleId: schedule.id,
            token: buildScheduleToken(schedule.id),
            eventId: link.eventId,
            state: 'verified',
          });
          result.verified += 1;
        } catch {
          drifted.push(schedule.id);
          await options.repository.saveLink({
            scheduleId: schedule.id,
            token: buildScheduleToken(schedule.id),
            eventId: link.eventId,
            state: 'drifted',
            error: 'Event not observed after write.',
          });
          result.drifted += 1;
        }
      }

      if (drifted.length > 0) {
        await safeNotify(options.notify, {
          kind: 'DRIFT',
          subject: `${drifted.length} First Due event(s) not observed after write`,
          lines: drifted.map((id) => `Schedule ${id} could not be re-read after writing.`),
        });
      }
    }

    if (result.created > 0 || result.cancelled > 0 || result.drifted > 0 || (options.dryRun && result.plannedCreates > 0)) {
      await safeNotify(options.notify, {
        kind: 'SUMMARY',
        subject: `First Due sync ${options.dryRun ? '(dry run)' : ''}: ${result.created} created, ${result.cancelled} cancelled, ${result.drifted} drifted`,
        lines: [
          `Window: ${window.from} .. ${window.to} (Eastern)`,
          `Planned: ${result.plannedCreates}`,
          `Created: ${result.created}`,
          `Cancelled: ${result.cancelled}`,
          `Verified: ${result.verified}`,
          `Drifted: ${result.drifted}`,
        ],
      });
    }

    return result;
  } catch (error) {
    const authFailure = (error as { name?: string })?.name === 'FirstDueAuthError';
    const shapeFailure = (error as { name?: string })?.name === 'FirstDueShapeError';
    result.status = 'failure';
    result.authFailure = authFailure;
    result.error = error instanceof Error ? error.message : 'First Due sync failed';

    await safeNotify(options.notify, {
      kind: authFailure ? 'AUTH' : 'DRIFT',
      subject: authFailure
        ? 'First Due session is not authorized'
        : shapeFailure
          ? 'First Due sync needs an update'
          : 'First Due sync failed',
      lines: [result.error],
    });

    return result;
  }
}
