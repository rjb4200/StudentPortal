import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { buildOnboardingCompleteStudentEmail, buildOnboardingCompleteAdminEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const { studentId } = await request.json();

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from('students')
    .select('id, auth_user_id, full_name, email, school_name')
    .eq('id', studentId)
    .single();

  if (!student) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  let tempPassword: string | null = null;
  let isNewAccount = false;
  let authUserId: string | null = null;

  try {
    const { data: existing } = await supabase.auth.admin.listUsers();
    let authMatch = existing?.users?.find((u) => u.email?.toLowerCase() === student.email.toLowerCase());

    if (!authMatch) {
      tempPassword = String(Math.floor(100000 + Math.random() * 900000));
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role: 'student' },
      });

      if (createError || !created?.user) {
        console.error('Auth user creation failed:', createError);
        return NextResponse.json({ success: false, error: 'Failed to create auth user' }, { status: 500 });
      }
      authMatch = created.user;
      isNewAccount = true;
    }

    authUserId = authMatch.id;

    const { error: linkError } = await supabase
      .from('students')
      .update({ auth_user_id: authUserId, onboarding_completed_at: new Date().toISOString() })
      .eq('id', studentId);

    if (linkError) {
      console.error('Failed to link auth_user_id:', linkError);
      return NextResponse.json({ success: false, error: 'Failed to link student to auth user' }, { status: 500 });
    }

    const { data: verify } = await supabase
      .from('students')
      .select('auth_user_id, onboarding_completed_at')
      .eq('id', studentId)
      .single();

    console.log('onboarding completion link verify:', { studentId, expected: authUserId, actual: verify?.auth_user_id, completedAt: verify?.onboarding_completed_at });
  } catch (e) {
    console.error('Auth creation or linking failed:', e);
    return NextResponse.json({ success: false, error: 'Auth setup failed' }, { status: 500 });
  }

  console.log('Onboarding complete auth result:', { isNewAccount, tempPassword: tempPassword ? '***' : null, email: student.email, authUserId });

  const { data: admins } = await supabase
    .from('admin_accounts')
    .select('email')
    .eq('is_active', true)
    .eq('notify_onboarding_complete', true);

  if (admins?.length) {
    const { subject, html } = buildOnboardingCompleteAdminEmail({
      full_name: student.full_name,
      email: student.email,
      school_name: student.school_name,
    });
    try {
      await sendEmail({ to: admins.map((a: any) => a.email), subject, html });
    } catch {}
  }

  {
    const loginUrl = `${request.nextUrl.origin}/login`;
    const { subject, html } = buildOnboardingCompleteStudentEmail({
      email: student.email,
      temp_password: tempPassword,
      login_url: loginUrl,
    });
    try {
      await sendEmail({ to: student.email, subject, html });
    } catch {}
  }

  return NextResponse.json({ success: true, password: tempPassword, email: student.email, isNewAccount });
}
