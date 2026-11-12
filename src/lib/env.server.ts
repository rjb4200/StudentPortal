import 'server-only';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local or your Vercel project settings.`
    );
  }
  return value;
}

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: required(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
} as const;

const TRUE_VALUES = /^(1|true|yes|on)$/i;

function isEnabled(value: string | undefined): boolean {
  return TRUE_VALUES.test((value ?? '').trim());
}

function pathMode(value: string | undefined, name: string): 'shadow' | 'documented' {
  const mode = (value ?? 'shadow').trim().toLowerCase();
  if (mode !== 'shadow' && mode !== 'documented') {
    throw new Error(`${name} must be "shadow" or "documented".`);
  }
  return mode;
}

function eventTypeId(value: string | undefined): number {
  const id = value == null || value === '' ? 11126 : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('FIRST_DUE_EVENT_TYPE_ID must be a positive integer.');
  }
  return id;
}

function syncWindowDays(value: string | undefined): number {
  const days = value == null || value === '' ? 5 : Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 31) {
    throw new Error('FIRST_DUE_WINDOW_DAYS must be an integer from 1 to 31.');
  }
  return days;
}

const firstDueEnabled = isEnabled(process.env.FIRST_DUE_SYNC_ENABLED);
const firstDueSession = process.env.FIRST_DUE_SESSION?.trim() || undefined;
const firstDueEmail = process.env.FIRST_DUE_EMAIL?.trim() || undefined;
const firstDuePassword = process.env.FIRST_DUE_PASSWORD || undefined;
const hasFirstDueCredentials = Boolean(firstDueEmail && firstDuePassword);

if (firstDueEnabled && !firstDueSession && !hasFirstDueCredentials) {
  throw new Error(
    'First Due sync is enabled but no credentials are configured. Set FIRST_DUE_SESSION or FIRST_DUE_EMAIL and FIRST_DUE_PASSWORD.'
  );
}

const pushoverToken =
  process.env.PUSHOVER_TOKEN?.trim() || process.env.PUSHOVER_APP_TOKEN?.trim() || undefined;
const pushoverUser =
  process.env.PUSHOVER_USER?.trim() || process.env.PUSHOVER_USER_KEY?.trim() || undefined;

export const firstDueEnv = {
  enabled: firstDueEnabled,
  writesEnabled: isEnabled(process.env.FIRST_DUE_WRITES_ENABLED),
  session: firstDueSession,
  email: firstDueEmail,
  password: firstDuePassword,
  hasCredentials: hasFirstDueCredentials,
  writePath: pathMode(process.env.FIRST_DUE_WRITE_PATH, 'FIRST_DUE_WRITE_PATH'),
  verifyPath: pathMode(process.env.FIRST_DUE_VERIFY_PATH, 'FIRST_DUE_VERIFY_PATH'),
  eventTypeId: eventTypeId(process.env.FIRST_DUE_EVENT_TYPE_ID),
  windowDays: syncWindowDays(process.env.FIRST_DUE_WINDOW_DAYS),
  alertEmail: process.env.FIRST_DUE_ALERT_EMAIL?.trim() || undefined,
  pushover: { token: pushoverToken, user: pushoverUser },
  hasSession: Boolean(firstDueSession),
  hasPushover: Boolean(pushoverToken && pushoverUser),
} as const;
