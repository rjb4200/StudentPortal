import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildEmailHtml } from '@/lib/email-html';
import { escHtml } from '@/lib/esc-html';
import { z } from 'zod';

const broadcastEmailBody = z.object({
  studentIds: z.array(z.string().uuid()).min(1),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieHeader.split(';').map((cookie) => { const [name, ...rest] = cookie.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = broadcastEmailBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const adminClient = createAdminClient();
  const { data: students } = await adminClient
    .from('students')
    .select('email, full_name')
    .in('id', parsed.data.studentIds)
    .eq('is_blacklisted', false)
    .not('email', 'is', null);

  if (!students || students.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  const results = await Promise.all(
    students.map((s) => {
      const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">${escHtml(parsed.data.body)}</p>`;
      const html = buildEmailHtml(escHtml(parsed.data.title), bodyHtml);
      return sendEmail({ to: s.email!, subject: `WFD EMS: ${parsed.data.title}`, html });
    })
  );

  const failures = results.filter((r) => !r.ok).length;
  if (failures > 0) {
    console.error(`Broadcast email: ${failures}/${results.length} deliveries failed`);
  }

  return NextResponse.json({ success: true, sent: results.length - failures, total: results.length });
}
