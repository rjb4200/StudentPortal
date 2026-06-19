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

export const EMAIL_LOGO_URL = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg';
export const EMAIL_CRIMSON = '#A40104';
export const EMAIL_CHARCOAL = '#1C1C1E';

export function buildEmailHtml(title: string, bodyHtml: string, loginUrl?: string): string {
  const ctaButton = loginUrl
    ? `<div style="margin:30px 0;text-align:center;">
                <a href="${loginUrl}" style="display:inline-block;background:${EMAIL_CRIMSON};color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;box-shadow:0 4px 12px rgba(164,1,4,0.25);">View Your Dashboard</a>
              </div>`
    : '';

  return `<div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:${EMAIL_CHARCOAL};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;margin:0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,0.10);">
          <tr>
            <td style="background:${EMAIL_CRIMSON};padding:30px 28px 26px 28px;text-align:center;border-bottom:6px solid ${EMAIL_CHARCOAL};">
              <img src="${EMAIL_LOGO_URL}" alt="Winchester Fire Department" width="150" style="display:block;margin:0 auto 18px auto;width:150px;max-width:150px;height:auto;border:0;" />
              <div style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff;font-weight:700;">Winchester Fire Department</div>
              <div style="margin-top:8px;font-size:26px;line-height:1.2;color:#ffffff;font-weight:800;">Division of EMS</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 34px 16px 34px;">
              <h1 style="margin:0 0 12px 0;color:${EMAIL_CHARCOAL};font-size:28px;line-height:1.25;font-weight:800;text-align:center;">${title}</h1>
              ${bodyHtml}
              ${ctaButton}
            </td>
          </tr>
          <tr>
            <td style="padding:0 34px 32px 34px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0 18px 0;" />
              <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;text-align:center;">Winchester Fire Department — Division of EMS<br />EMS Student Training & Rotation Portal</p>
            </td>
          </tr>
        </table>
        <p style="max-width:640px;margin:16px auto 0 auto;color:#9ca3af;font-size:11px;line-height:1.5;text-align:center;">This is an automated message from the WFD EMS Student Portal.</p>
      </td>
    </tr>
  </table>
</div>`;
}
