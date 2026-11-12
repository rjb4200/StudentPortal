import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key';

const FIRST_DUE_KEYS = [
  'FIRST_DUE_SYNC_ENABLED',
  'FIRST_DUE_SESSION',
  'FIRST_DUE_EMAIL',
  'FIRST_DUE_PASSWORD',
  'FIRST_DUE_WRITE_PATH',
  'FIRST_DUE_VERIFY_PATH',
  'FIRST_DUE_EVENT_TYPE_ID',
  'FIRST_DUE_WINDOW_DAYS',
  'PUSHOVER_TOKEN',
  'PUSHOVER_USER',
  'PUSHOVER_APP_TOKEN',
  'PUSHOVER_USER_KEY',
];

afterEach(() => {
  for (const key of FIRST_DUE_KEYS) delete process.env[key];
  vi.resetModules();
});

describe('firstDueEnv', () => {
  it('does not require a session while the sync is disabled', async () => {
    vi.resetModules();
    const { firstDueEnv } = await import('@/lib/env.server');
    expect(firstDueEnv.enabled).toBe(false);
    expect(firstDueEnv.session).toBeUndefined();
    expect(firstDueEnv.hasSession).toBe(false);
    expect(firstDueEnv.writePath).toBe('shadow');
    expect(firstDueEnv.verifyPath).toBe('shadow');
    expect(firstDueEnv.eventTypeId).toBe(11126);
    expect(firstDueEnv.windowDays).toBe(5);
  });

  it('requires a session or credentials once the sync is enabled', async () => {
    process.env.FIRST_DUE_SYNC_ENABLED = 'true';
    vi.resetModules();
    await expect(import('@/lib/env.server')).rejects.toThrow(/no credentials are configured/);
  });

  it('accepts email and password without a session', async () => {
    process.env.FIRST_DUE_SYNC_ENABLED = 'true';
    process.env.FIRST_DUE_EMAIL = 'user@example.com';
    process.env.FIRST_DUE_PASSWORD = 'secret';
    vi.resetModules();
    const { firstDueEnv } = await import('@/lib/env.server');
    expect(firstDueEnv.hasCredentials).toBe(true);
    expect(firstDueEnv.hasSession).toBe(false);
  });

  it('accepts a configured session and reports presence without values', async () => {
    process.env.FIRST_DUE_SYNC_ENABLED = 'true';
    process.env.FIRST_DUE_SESSION = 'session-cookie-value';
    vi.resetModules();
    const { firstDueEnv } = await import('@/lib/env.server');
    expect(firstDueEnv.enabled).toBe(true);
    expect(firstDueEnv.hasSession).toBe(true);
    expect(JSON.stringify({ hasSession: firstDueEnv.hasSession })).not.toContain('session-cookie-value');
  });

  it('falls back to the legacy Pushover variable names', async () => {
    process.env.PUSHOVER_APP_TOKEN = 'app-token';
    process.env.PUSHOVER_USER_KEY = 'user-key';
    vi.resetModules();
    const { firstDueEnv } = await import('@/lib/env.server');
    expect(firstDueEnv.hasPushover).toBe(true);
    expect(firstDueEnv.pushover).toEqual({ token: 'app-token', user: 'user-key' });
  });

  it('rejects unknown path modes', async () => {
    process.env.FIRST_DUE_WRITE_PATH = 'guess';
    vi.resetModules();
    await expect(import('@/lib/env.server')).rejects.toThrow(/FIRST_DUE_WRITE_PATH/);
  });

  it('rejects a non-positive event type id', async () => {
    process.env.FIRST_DUE_EVENT_TYPE_ID = 'zero';
    vi.resetModules();
    await expect(import('@/lib/env.server')).rejects.toThrow(/FIRST_DUE_EVENT_TYPE_ID/);
  });
});
