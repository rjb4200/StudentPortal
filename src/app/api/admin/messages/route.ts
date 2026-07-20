import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { adminMessageReplyBody } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { buildAdminReplyStudentEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieHeader.split(';').map((cookie) => { const [name, ...rest] = cookie.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = adminMessageReplyBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const adminClient = createAdminClient();
  const { data: student } = await adminClient.from('students').select('id, full_name, email').eq('id', parsed.data.studentId).single();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  const { data: message, error } = await adminClient.from('messages').insert({
    student_id: student.id,
    sender: 'admin',
    message_text: parsed.data.message,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (student.email) {
    const dashboardUrl = `${publicEnv.SITE_URL}/dashboard`;
    const email = buildAdminReplyStudentEmail({
      student_name: student.full_name,
      message_text: message.message_text,
      dashboard_url: dashboardUrl,
    });
    sendEmail({ to: student.email, subject: email.subject, html: email.html }).then((result) => {
      if (!result.ok) console.error(`Admin reply notification failed for ${student.email}: ${result.error}`);
    });
  }

  return NextResponse.json({ success: true, message });
}
