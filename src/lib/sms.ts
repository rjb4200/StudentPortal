import 'server-only';

import { serverEnv } from '@/lib/env.server';

interface SendSmsParams {
  to: string;
  body: string;
}

interface SendSmsResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 5000;

export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  const input = phone?.trim();
  if (!input) return null;

  if (input.startsWith('+')) {
    const digits = input.slice(1).replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
  }

  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const to = normalizePhoneNumber(params.to);
  if (!to) {
    return { ok: false, error: 'Invalid destination phone number' };
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = serverEnv;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { ok: false, error: 'Twilio SMS is not configured' };
  }

  const from = normalizePhoneNumber(TWILIO_PHONE_NUMBER);
  if (!from) {
    return { ok: false, error: 'Invalid Twilio sender phone number' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const body = new URLSearchParams({ To: to, From: from, Body: params.body });
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null) as { sid?: string; message?: string } | null;
    if (!res.ok) {
      return { ok: false, error: json?.message || `Twilio returned ${res.status}` };
    }

    return { ok: true, providerMessageId: json?.sid };
  } catch (e: unknown) {
    if ((e as Error)?.name === 'AbortError') {
      return { ok: false, error: `SMS send timed out after ${DEFAULT_TIMEOUT_MS / 1000}s` };
    }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timeoutId);
  }
}
