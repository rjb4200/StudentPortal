import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_PHONE_NUMBER;
});

describe('normalizePhoneNumber', () => {
  it('normalizes US numbers to E.164', async () => {
    const { normalizePhoneNumber } = await import('@/lib/sms');

    expect(normalizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
    expect(normalizePhoneNumber('1-555-123-4567')).toBe('+15551234567');
    expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
  });

  it('rejects invalid numbers', async () => {
    const { normalizePhoneNumber } = await import('@/lib/sms');

    expect(normalizePhoneNumber('123')).toBeNull();
    expect(normalizePhoneNumber('not a phone')).toBeNull();
    expect(normalizePhoneNumber(null)).toBeNull();
  });
});

describe('sendSms', () => {
  it('returns configuration failure when Twilio env is missing', async () => {
    const { sendSms } = await import('@/lib/sms');

    await expect(sendSms({ to: '5551234567', body: 'Hello' })).resolves.toEqual({
      ok: false,
      error: 'Twilio SMS is not configured',
    });
  });

  it('sends Twilio request and returns provider message id', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC123';
    process.env.TWILIO_AUTH_TOKEN = 'auth-token';
    process.env.TWILIO_PHONE_NUMBER = '+15550000000';
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ sid: 'SM123' }) }));
    vi.stubGlobal('fetch', fetchMock);

    const { sendSms } = await import('@/lib/sms');
    const result = await sendSms({ to: '5551234567', body: 'Hello' });

    expect(result).toEqual({ ok: true, providerMessageId: 'SM123' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
