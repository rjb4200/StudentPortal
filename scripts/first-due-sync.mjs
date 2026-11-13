#!/usr/bin/env node
/**
 * First Due student-ride sync for a Windows scheduled task.
 *
 * Standalone: Node 20+ only, no npm dependencies. It logs in to First Due at
 * runtime, reconciles the next N days of approved shifts, verifies the writes,
 * and records the ledger + job run in Supabase.
 *
 * Config comes from a .env-style file (default: scripts/first-due-sync.env),
 * and process.env overrides it.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://sizeup.firstduesizeup.com';
const TIME_ZONE = 'America/New_York';
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36';

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(process.env.FIRST_DUE_ENV_FILE || resolve(HERE, 'first-due-sync.env'));

const cfg = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  email: process.env.FIRST_DUE_EMAIL || '',
  password: process.env.FIRST_DUE_PASSWORD || '',
  eventTypeId: Number(process.env.FIRST_DUE_EVENT_TYPE_ID || 11126),
  windowDays: Number(process.env.FIRST_DUE_WINDOW_DAYS || 5),
  alertEmail: process.env.FIRST_DUE_ALERT_EMAIL || '',
  resendKey: process.env.RESEND_API_KEY || '',
  pushoverToken: process.env.PUSHOVER_APP_TOKEN || process.env.PUSHOVER_TOKEN || '',
  pushoverUser: process.env.PUSHOVER_USER_KEY || process.env.PUSHOVER_USER || '',
  dryRun: /^(1|true|yes|on)$/i.test(process.env.DRY_RUN || ''),
};

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function requireConfig() {
  const missing = [];
  if (!cfg.supabaseUrl) missing.push('SUPABASE_URL');
  if (!cfg.serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!cfg.email) missing.push('FIRST_DUE_EMAIL');
  if (!cfg.password) missing.push('FIRST_DUE_PASSWORD');
  if (!Number.isInteger(cfg.eventTypeId) || cfg.eventTypeId <= 0) missing.push('FIRST_DUE_EVENT_TYPE_ID');
  if (!Number.isInteger(cfg.windowDays) || cfg.windowDays < 1 || cfg.windowDays > 31) missing.push('FIRST_DUE_WINDOW_DAYS');
  if (missing.length) throw new Error(`Missing or invalid configuration: ${missing.join(', ')}`);
}

/* ------------------------------------------------------------------ time */

const pad = (value) => String(value).padStart(2, '0');

function easternParts(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const value = (type) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
}

function parseIsoDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function addDays(date, days) {
  const parts = parseIsoDate(date);
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function getEasternDateSpan(days, now = new Date()) {
  const parts = easternParts(now);
  const from = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  return { from, to: addDays(from, days - 1) };
}

function normalizeClockTime(value) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/.exec(String(value).trim());
  if (!match) throw new Error(`Invalid time: ${value}`);
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;
  const meridiem = match[4]?.toLowerCase();
  if (minute > 59 || second > 59) throw new Error(`Invalid time: ${value}`);
  if (meridiem) {
    if (hour < 1 || hour > 12) throw new Error(`Invalid time: ${value}`);
    hour = meridiem === 'am' ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;
  } else if (hour > 23) {
    throw new Error(`Invalid time: ${value}`);
  }
  return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function formatEasternDateTime(date, time) {
  const day = parseIsoDate(date);
  const clock = normalizeClockTime(time);
  return `${pad(day.month)}/${pad(day.day)}/${day.year} ${clock}`;
}

function toApiDate(date) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);
  if (us) return `${pad(Number(us[1]))}/${pad(Number(us[2]))}/${us[3]}`;
  throw new Error(`Invalid date: ${date}`);
}

/* --------------------------------------------------------------- first due */

const jar = new Map();

function cookieHeader() {
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
}

function absorbCookies(response) {
  const list = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  for (const raw of list) {
    const pair = raw.split(';')[0];
    const index = pair.indexOf('=');
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

function firstDueHeaders(path) {
  return {
    'x-requested-with': 'XMLHttpRequest',
    origin: BASE,
    referer: path.startsWith('/auth/') ? `${BASE}/auth/signin-v2` : `${BASE}/`,
    'user-agent': BROWSER_UA,
    accept: 'application/json, text/plain, */*',
    ...(cookieHeader() ? { cookie: cookieHeader() } : {}),
  };
}

async function login() {
  let response = await fetch(`${BASE}/auth/identifier`, {
    method: 'POST',
    headers: { ...firstDueHeaders('/auth/identifier'), 'content-type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({ email: cfg.email }),
  });
  absorbCookies(response);
  if (response.status !== 200) throw new Error(`First Due identifier step failed (${response.status}).`);

  response = await fetch(`${BASE}/auth/password-challenge`, {
    method: 'POST',
    headers: { ...firstDueHeaders('/auth/password-challenge'), 'content-type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({
      email: cfg.email,
      password: cfg.password,
      rememberMe: false,
      verifyCode: '',
      mfaOtp: '',
      bypassExpiring: false,
      credentialsOnly: false,
    }),
  });
  absorbCookies(response);
  const text = await response.text();
  if (response.status !== 200) throw new Error(`First Due password step failed (${response.status}).`);
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error('First Due login returned a non-JSON response.');
  }
  if (body.result !== true) throw new Error('First Due rejected the login credentials.');
}

async function fd(path, method = 'GET', body, retry = true) {
  if (!cookieHeader()) await login();

  const headers = firstDueHeaders(path);
  if (method === 'POST') headers['content-type'] = 'application/json;charset=UTF-8';

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
    redirect: 'manual',
  });
  absorbCookies(response);

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const rejected = response.status === 401 || response.status === 403 || contentType.includes('text/html');

  if (rejected && retry) {
    await login();
    return fd(path, method, body, false);
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`First Due returned ${response.status}.`);
  }
  if (contentType.includes('text/html')) throw new Error('First Due returned a login page.');

  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('First Due returned a non-JSON response.');
  }
}

async function canary() {
  const payload = await fd('/event-log/getEventTypes?pageSize=1&type=all');
  if (payload.success !== true || !Array.isArray(payload.event_types)) {
    throw new Error('First Due event type response did not match the expected shape.');
  }
}

async function getActivity(id, date) {
  const payload = await fd(`/event-log/getActivityInfo?id=${id}&module=Event&date=${encodeURIComponent(toApiDate(date))}`);
  if (payload.success !== true || !payload.activity || typeof payload.activity.id !== 'number') {
    throw new Error(`First Due event ${id} could not be read.`);
  }
  const activity = payload.activity;
  return {
    id: activity.id,
    name: String(activity.name ?? ''),
    notes: String(activity.notes ?? ''),
    startAt: String(activity.start_at ?? ''),
    endAt: String(activity.end_at ?? ''),
    eventTypeId: Array.isArray(activity.event_type_id) ? activity.event_type_id : [],
    statusCode: String(activity.status_code ?? ''),
    date: typeof activity.date === 'string' ? activity.date : date,
  };
}

function eventPayload(input) {
  return {
    name: input.name,
    notes: input.notes,
    start_at: input.startAt,
    end_at: input.endAt,
    event_type_id: input.eventTypeId ?? [],
    require_status_update: false,
    allow_clock_in_attendance: false,
    all_day_event: false,
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

async function saveEvent(input, id) {
  const event = eventPayload(input);
  const payload = await fd('/eventCreationLog/save', 'POST', { event_log: id == null ? event : { ...event, id } });
  if (payload.result !== true) throw new Error(payload.msg || 'First Due rejected the event save.');
  const saved = payload.data?.event_log;
  if (!saved || typeof saved.id !== 'number') throw new Error('Saved event is missing an id.');
  return {
    id: saved.id,
    name: String(saved.name ?? input.name),
    statusCode: String(saved.status_code ?? ''),
    startAt: String(saved.start_at ?? input.startAt),
    endAt: String(saved.end_at ?? input.endAt),
  };
}

async function updateEvent(id, input) {
  return saveEvent(input, id);
}

async function deleteEvent(id) {
  const payload = await fd('/event-log/deleteEvent', 'POST', { id });
  if (payload.result !== true) throw new Error(payload.msg || 'First Due rejected the event delete.');
}

async function cancelEvent(detail) {
  const name = detail.name.startsWith('[CANCELLED]') ? detail.name : `[CANCELLED] ${detail.name}`;
  try {
    return await updateEvent(detail.id, {
      name,
      notes: detail.notes,
      startAt: detail.startAt,
      endAt: detail.endAt,
      eventTypeId: detail.eventTypeId,
    });
  } catch {
    await deleteEvent(detail.id);
    return { id: detail.id, deleted: true };
  }
}

/* ---------------------------------------------------------------- supabase */

async function sb(path, { method = 'GET', body, prefer } = {}) {
  const response = await fetch(`${cfg.supabaseUrl.replace(/\/+$/, '')}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: cfg.serviceKey,
      authorization: `Bearer ${cfg.serviceKey}`,
      'content-type': 'application/json',
      ...(prefer ? { prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${path.split('?')[0]} failed (${response.status}): ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function listApprovedSchedules(from, to) {
  const query = new URLSearchParams();
  query.set('select', 'id,date,shift_type,start_time,end_time,students!inner(full_name,training_class_id),preceptors(full_name)');
  query.set('status', 'eq.approved');
  query.set('date', `gte.${from}`);
  query.append('date', `lte.${to}`);

  const rows = await sb(`schedules?${query.toString()}`);
  const classIds = [...new Set(rows.map((row) => row.students?.training_class_id).filter(Boolean))];
  const classNames = new Map();
  if (classIds.length > 0) {
    const classQuery = new URLSearchParams();
    classQuery.set('select', 'id,name');
    classQuery.set('id', `in.(${classIds.join(',')})`);
    for (const item of await sb(`training_classes?${classQuery.toString()}`)) {
      classNames.set(item.id, item.name);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    shift_type: row.shift_type,
    start_time: row.start_time,
    end_time: row.end_time,
    studentName: row.students?.full_name ?? 'Unknown student',
    className: row.students?.training_class_id ? classNames.get(row.students.training_class_id) ?? null : null,
    preceptorName: row.preceptors?.full_name ?? null,
  }));
}

async function listLinks(from, to) {
  const query = new URLSearchParams();
  query.set('select', 'schedule_id,event_id,state,schedules!inner(date,status)');
  query.set('schedules.date', `gte.${from}`);
  query.append('schedules.date', `lte.${to}`);

  const rows = await sb(`first_due_event_links?${query.toString()}`);
  return rows.map((row) => ({
    scheduleId: row.schedule_id,
    eventId: row.event_id,
    state: row.state,
    date: row.schedules?.date ?? '',
    status: row.schedules?.status ?? 'unknown',
  }));
}

async function saveLink(link) {
  const now = new Date().toISOString();
  await sb('first_due_event_links?on_conflict=schedule_id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: [
      {
        schedule_id: link.scheduleId,
        token: link.token,
        state: link.state,
        last_error: link.error ?? null,
        event_id: link.eventId ?? null,
        ...(link.state === 'posted' ? { posted_at: now } : {}),
        ...(link.state === 'verified' ? { verified_at: now } : {}),
      },
    ],
  });
}

async function recordJobRun({ status, startedAt, finishedAt, summary, errorMessage }) {
  await sb('system_job_runs', {
    method: 'POST',
    prefer: 'return=minimal',
    body: [
      {
        job_name: 'first_due_sync',
        status,
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_ms: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
        summary: summary ?? {},
        error_message: errorMessage ?? null,
      },
    ],
  });
}

/* ------------------------------------------------------------------ sync */

const PRESET_TIMES = {
  full: { start: '07:00', end: '22:00' },
  day: { start: '07:00', end: '19:00' },
  night: { start: '19:00', end: '07:00' },
};

const SHIFT_LABELS = { full: 'Full shift', day: 'Day shift', night: 'Night shift', custom: 'Custom shift' };

function minutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function buildEventInput(schedule) {
  const preset = PRESET_TIMES[schedule.shift_type];
  const start = normalizeClockTime(schedule.start_time || preset?.start || '07:00');
  const end = normalizeClockTime(schedule.end_time || preset?.end || '19:00');
  const endDate = minutes(end) <= minutes(start) ? addDays(schedule.date, 1) : schedule.date;

  const notes = [
    `Student: ${schedule.studentName}`,
    ...(schedule.className ? [`Class: ${schedule.className}`] : []),
    `Shift: ${SHIFT_LABELS[schedule.shift_type] ?? schedule.shift_type} ${schedule.start_time || preset?.start || '07:00'}–${schedule.end_time || preset?.end || '19:00'}`,
    ...(schedule.preceptorName ? [`Preceptor: ${schedule.preceptorName}`] : []),
  ].join('\n');

  return {
    input: {
      name: `Student Ride — ${schedule.studentName}`,
      notes,
      startAt: formatEasternDateTime(schedule.date, start),
      endAt: formatEasternDateTime(endDate, end),
      eventTypeId: [cfg.eventTypeId],
    },
  };
}

async function withRetry(action, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function notify(kind, subject, lines) {
  const problems = [];
  if (cfg.alertEmail && cfg.resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${cfg.resendKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: 'WFD EMS Portal <students@winchesterfireems.com>',
          to: cfg.alertEmail,
          subject: `[First Due] ${subject}`,
          html: `<h2>First Due sync: ${kind}</h2><p>${subject}</p><ul>${lines
            .map((line) => `<li>${String(line).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</li>`)
            .join('')}</ul>`,
        }),
      });
      if (!response.ok) problems.push(`email ${response.status}`);
    } catch (error) {
      problems.push(`email ${error.message}`);
    }
  }

  if (cfg.pushoverToken && cfg.pushoverUser) {
    try {
      const response = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: cfg.pushoverToken,
          user: cfg.pushoverUser,
          title: `First Due ${kind}`,
          message: subject,
        }).toString(),
      });
      if (!response.ok) problems.push(`push ${response.status}`);
    } catch (error) {
      problems.push(`push ${error.message}`);
    }
  }

  if (problems.length) log('alert delivery issues:', problems.join('; '));
}

async function main() {
  requireConfig();
  const startedAt = new Date();
  const window = getEasternDateSpan(cfg.windowDays, startedAt);
  const result = {
    status: 'success',
    window,
    dryRun: cfg.dryRun,
    plannedCreates: 0,
    created: 0,
    cancelled: 0,
    verified: 0,
    drifted: 0,
  };

  log(`starting${cfg.dryRun ? ' (dry run)' : ''}`, JSON.stringify(window));

  let authFailure = false;
  try {
    await canary();

    const schedules = await listApprovedSchedules(window.from, window.to);
    const links = await listLinks(window.from, window.to);
    const expected = new Set(schedules.map((schedule) => schedule.id));
    const linkBySchedule = new Map(links.map((link) => [link.scheduleId, link]));

    for (const schedule of schedules) {
      const link = linkBySchedule.get(schedule.id);
      if (link?.eventId != null && link.state !== 'cancelled') continue;

      result.plannedCreates += 1;
      const { input } = buildEventInput(schedule);
      const token = `SP#${schedule.id}`;

      if (cfg.dryRun) {
        await saveLink({ scheduleId: schedule.id, token, state: 'planned' });
        continue;
      }

      const saved = await withRetry(() => saveEvent(input));
      await saveLink({ scheduleId: schedule.id, token, state: 'posted', eventId: saved.id });
      linkBySchedule.set(schedule.id, {
        scheduleId: schedule.id,
        eventId: saved.id,
        state: 'posted',
        date: schedule.date,
        status: 'approved',
      });
      result.created += 1;
      log(`created event ${saved.id} for ${schedule.studentName} on ${schedule.date}`);
    }

    for (const link of links) {
      if (link.eventId == null || link.state === 'cancelled') continue;
      if (expected.has(link.scheduleId) || link.status === 'approved') continue;
      if (cfg.dryRun) continue;

      try {
        const detail = await getActivity(link.eventId, link.date);
        await withRetry(() => cancelEvent(detail));
        await saveLink({ scheduleId: link.scheduleId, token: `SP#${link.scheduleId}`, state: 'cancelled', eventId: link.eventId });
        result.cancelled += 1;
        log(`cancelled event ${link.eventId} for schedule ${link.scheduleId}`);
      } catch (error) {
        await saveLink({
          scheduleId: link.scheduleId,
          token: `SP#${link.scheduleId}`,
          state: 'drifted',
          eventId: link.eventId,
          error: error.message,
        });
        result.drifted += 1;
        log(`cancellation failed for ${link.scheduleId}:`, error.message);
      }
    }

    if (!cfg.dryRun) {
      const drifted = [];
      for (const schedule of schedules) {
        const link = linkBySchedule.get(schedule.id);
        if (!link?.eventId) continue;
        try {
          const detail = await getActivity(link.eventId, schedule.date);
          if (detail.id !== link.eventId) throw new Error('Event id mismatch');
          await saveLink({ scheduleId: schedule.id, token: `SP#${schedule.id}`, state: 'verified', eventId: link.eventId });
          result.verified += 1;
        } catch {
          drifted.push(schedule.id);
          await saveLink({
            scheduleId: schedule.id,
            token: `SP#${schedule.id}`,
            state: 'drifted',
            eventId: link.eventId,
            error: 'Event not observed after write.',
          });
          result.drifted += 1;
        }
      }

      if (drifted.length) {
        await notify('DRIFT', `${drifted.length} First Due event(s) not observed after write`, drifted);
      }
    }

    if (result.created > 0 || result.cancelled > 0 || result.drifted > 0 || (cfg.dryRun && result.plannedCreates > 0)) {
      await notify(
        'SUMMARY',
        `First Due sync${cfg.dryRun ? ' (dry run)' : ''}: ${result.created} created, ${result.cancelled} cancelled, ${result.drifted} drifted`,
        [
          `Window: ${window.from} .. ${window.to} (Eastern)`,
          `Planned: ${result.plannedCreates}`,
          `Created: ${result.created}`,
          `Cancelled: ${result.cancelled}`,
          `Verified: ${result.verified}`,
          `Drifted: ${result.drifted}`,
        ]
      );
    }

    const finishedAt = new Date();
    await recordJobRun({ status: 'success', startedAt, finishedAt, summary: result });
    log('done', JSON.stringify(result));
  } catch (error) {
    authFailure = /auth|credential|login|not authorized|403|401/i.test(error.message);
    result.status = 'failure';
    result.error = error.message;
    log('FAILED:', error.message);
    await notify(authFailure ? 'AUTH' : 'DRIFT', authFailure ? 'First Due login failed' : 'First Due sync failed', [error.message]);
    try {
      await recordJobRun({ status: 'failure', startedAt, finishedAt: new Date(), summary: result, errorMessage: error.message });
    } catch (recordError) {
      log('could not record job run:', recordError.message);
    }
    process.exitCode = 1;
  }
}

main();
