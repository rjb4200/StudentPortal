import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildStudentApprovalEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: student, error: studentError } = await adminClient
    .from('students')
    .select('email, full_name, status, onboarding_completed_at')
    .eq('id', studentId)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  if (student.status !== 'pending') return NextResponse.json({ success: true, message: 'Already approved' });
  if (!student.onboarding_completed_at) return NextResponse.json({ error: 'Student has not completed onboarding.' }, { status: 400 });

  const { error: updateError } = await adminClient
    .from('students')
    .update({
      status: 'certified',
      access_until: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', studentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  {
    const loginUrl = `${publicEnv.SITE_URL}/login`;
    const { subject, html } = buildStudentApprovalEmail({ full_name: student.full_name, login_url: loginUrl });
    try {
      await sendEmail({ to: student.email, subject, html });
    } catch {}
  }

  return NextResponse.json({ success: true });
}
