import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { messageBody } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { buildStudentMessageAdminEmail } from '@/lib/email-templates';

const COOLDOWN_MS = 10_000;
const lastSentAt = new Map<string, number>();

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieHeader.split(';').map((cookie) => { const [name, ...rest] = cookie.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = messageBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const now = Date.now();
  if (now - (lastSentAt.get(user.id) ?? 0) < COOLDOWN_MS) {
    return NextResponse.json({ error: 'Please wait a few seconds before sending another message.' }, { status: 429 });
  }

  const adminClient = createAdminClient();
  const { data: student } = await adminClient
    .from('students')
    .select('id, full_name, email, status, is_blacklisted')
    .eq('auth_user_id', user.id)
    .single();
  if (!student || student.is_blacklisted || !['pending', 'certified'].includes(student.status)) {
    return NextResponse.json({ error: 'You are not eligible to send messages.' }, { status: 403 });
  }

  const { data: message, error } = await adminClient.from('messages').insert({
    student_id: student.id,
    sender: 'student',
    message_text: parsed.data.message,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  lastSentAt.set(user.id, now);

  const { data: admins } = await adminClient
    .from('admin_accounts')
    .select('email')
    .eq('is_active', true)
    .eq('notify_student_messages', true);
  const conversationUrl = `${publicEnv.SITE_URL}/admin?tab=daily&student=${encodeURIComponent(student.id)}`;
  const email = buildStudentMessageAdminEmail({
    student_name: student.full_name,
    student_email: student.email,
    message_text: message.message_text,
    conversation_url: conversationUrl,
  });
  await Promise.all((admins ?? []).map(async (admin) => {
    const result = await sendEmail({ to: admin.email, subject: email.subject, html: email.html });
    if (!result.ok) console.error(`Student message notification failed for ${admin.email}: ${result.error}`);
  }));

  return NextResponse.json({ success: true, message });
}
