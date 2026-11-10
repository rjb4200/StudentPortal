import 'server-only';
import { firstDueEnv } from '@/lib/env.server';
import { sendEmail } from '@/lib/email';
import { escHtml } from '@/lib/esc-html';
import type { FirstDueAlert } from '@/lib/first-due/sync';

export type AlertEmailSender = (params: {
  to: string;
  subject: string;
  html: string;
}) => Promise<{ ok: boolean; error?: string }>;

export function createFirstDueAlertSender(send: AlertEmailSender = sendEmail) {
  return async (alert: FirstDueAlert): Promise<string[]> => {
    const issues: string[] = [];
    const lines = alert.lines.map((line) => `<li>${escHtml(line)}</li>`).join('');
    const html =
      `<h2>First Due sync: ${escHtml(alert.kind)}</h2>` +
      `<p>${escHtml(alert.subject)}</p>` +
      `<ul>${lines}</ul>`;

    if (firstDueEnv.alertEmail) {
      const result = await send({
        to: firstDueEnv.alertEmail,
        subject: `[First Due] ${alert.subject}`,
        html,
      });
      if (!result.ok) issues.push(`email: ${result.error ?? 'failed'}`);
    } else {
      issues.push('email: FIRST_DUE_ALERT_EMAIL is not configured');
    }

    if (firstDueEnv.hasPushover) {
      try {
        const body = new URLSearchParams({
          token: firstDueEnv.pushover.token ?? '',
          user: firstDueEnv.pushover.user ?? '',
          title: `First Due ${alert.kind}`,
          message: alert.subject,
        });
        const response = await fetch('https://api.pushover.net/1/messages.json', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        if (!response.ok) issues.push(`push: ${response.status}`);
      } catch (error) {
        issues.push(`push: ${error instanceof Error ? error.message : 'failed'}`);
      }
    }

    if (issues.length > 0) {
      console.error('First Due alert delivery issues:', issues.join('; '));
    }

    return issues;
  };
}
