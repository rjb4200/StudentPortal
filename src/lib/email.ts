import 'server-only';
import { serverEnv } from '@/lib/env.server';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResult {
  ok: boolean;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 5000;

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, from = 'WFD EMS Portal <onboarding@winchesterfireems.com>' } = params;

  if (!serverEnv.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '<unreadable>');
      console.error(`Resend email failed: status=${res.status} body=${body.substring(0, 200)}`);
      return { ok: false, error: `Resend returned ${res.status}` };
    }

    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if ((e as Error)?.name === 'AbortError') {
      console.error(`Resend email timed out after ${DEFAULT_TIMEOUT_MS}ms`);
      return { ok: false, error: `Email send timed out after ${DEFAULT_TIMEOUT_MS / 1000}s` };
    }
    console.error('Resend email failed:', message);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}
