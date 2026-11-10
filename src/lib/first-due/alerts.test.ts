import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  env: {
    alertEmail: 'operator@example.com' as string | undefined,
    hasPushover: false,
    pushover: { token: undefined as string | undefined, user: undefined as string | undefined },
  },
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/env.server', () => ({
  firstDueEnv: h.env,
  serverEnv: { SUPABASE_SERVICE_ROLE_KEY: 'key', RESEND_API_KEY: 'key' },
}));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn(async () => ({ ok: true })) }));

import { createFirstDueAlertSender } from '@/lib/first-due/alerts';

beforeEach(() => {
  h.env.alertEmail = 'operator@example.com';
  h.env.hasPushover = false;
  h.env.pushover = { token: undefined, user: undefined };
  vi.unstubAllGlobals();
});

describe('createFirstDueAlertSender', () => {
  it.each(['AUTH', 'DRIFT', 'SUMMARY'] as const)('emails the operator for %s', async (kind) => {
    const send = vi.fn<(params: { to: string; subject: string; html: string }) => Promise<{ ok: boolean }>>(
      async () => ({ ok: true })
    );
    const notify = createFirstDueAlertSender(send);

    await notify({ kind, subject: 'Something happened', lines: ['detail'] });

    expect(send).toHaveBeenCalledTimes(1);
    const params = send.mock.calls[0][0] as { to: string; subject: string; html: string };
    expect(params.to).toBe('operator@example.com');
    expect(params.subject).toContain('Something happened');
    expect(params.html).toContain(kind);
  });

  it('skips the email when no alert address is configured', async () => {
    h.env.alertEmail = undefined;
    const send = vi.fn(async () => ({ ok: true }));

    const issues = await createFirstDueAlertSender(send)({
      kind: 'DRIFT',
      subject: 'drift',
      lines: [],
    });

    expect(send).not.toHaveBeenCalled();
    expect(issues.join(' ')).toContain('FIRST_DUE_ALERT_EMAIL');
  });

  it('also pushes when Pushover is configured', async () => {
    h.env.hasPushover = true;
    h.env.pushover = { token: 'token', user: 'user' };
    const fetchMock = vi.fn(async () => ({ ok: true }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    const send = vi.fn(async () => ({ ok: true }));
    await createFirstDueAlertSender(send)({ kind: 'AUTH', subject: 'session', lines: [] });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.pushover.net/1/messages.json',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
