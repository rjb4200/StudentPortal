import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { buildOnboardingCompleteStudentEmail, buildOnboardingCompleteAdminEmail } from '@/lib/email-templates';
import { publicEnv } from '@/lib/env';
import { generateTemporaryPin, hashOnboardingToken } from '@/lib/onboarding-session';
import { onboardingCompleteBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = onboardingCompleteBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { studentId, onboardingToken } = parsed.data;

  const supabase = createAdminClient() as any;

  const { data: session, error: sessionError } = await supabase
    .from('onboarding_sessions')
    .select('id, expires_at, completed_at')
    .eq('student_id', studentId)
    .eq('token_hash', hashOnboardingToken(onboardingToken))
    .maybeSingle();

  if (sessionError) {
    console.error('Onboarding session verification failed:', sessionError);
    return NextResponse.json({ success: false, error: 'Unable to verify onboarding session.' }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ success: false, error: 'Your onboarding session could not be verified. Please restart registration or contact your instructor for help.' }, { status: 403 });
  }

  if (session.completed_at) {
    return NextResponse.json({ success: false, error: 'This onboarding session has already been completed.' }, { status: 409 });
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ success: false, error: 'Your onboarding session has expired. Please restart registration or contact your instructor for help.' }, { status: 403 });
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, auth_user_id, full_name, email, school_name, instructor_name, instructor_contact, status, is_blacklisted, onboarding_completed_at, legal_signature, training_classes(name, class_start_date, ride_time_end_date, training_sites(name, organization_name), instructors(first_name, last_name, email, mobile_phone, business_phone))')
    .eq('id', studentId)
    .single();

  if (!student) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  if (student.is_blacklisted || student.status !== 'pending' || student.onboarding_completed_at) {
    return NextResponse.json({ success: false, error: 'This student record is not eligible for onboarding completion.' }, { status: 409 });
  }

  if (!student.legal_signature) {
    return NextResponse.json({ success: false, error: 'Legal agreements must be completed before finishing onboarding.' }, { status: 409 });
  }

  let tempPassword: string | null = null;
  let isNewAccount = false;
  let authUserId: string | null = null;

  try {
    const { data: existing } = await supabase.auth.admin.listUsers();
    let authMatch = existing?.users?.find((u: { email?: string | null }) => u.email?.toLowerCase() === student.email.toLowerCase());

    if (!authMatch) {
      tempPassword = generateTemporaryPin();
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
      .eq('id', studentId)
      .is('onboarding_completed_at', null)
      .select('id')
      .single();

    if (linkError) {
      console.error('Failed to link auth_user_id:', linkError);
      return NextResponse.json({ success: false, error: 'Failed to link student to auth user' }, { status: 500 });
    }

    const { error: sessionUpdateError } = await supabase
      .from('onboarding_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session.id)
      .is('completed_at', null)
      .select('id')
      .single();

    if (sessionUpdateError) {
      console.error('Failed to complete onboarding session:', sessionUpdateError);
      return NextResponse.json({ success: false, error: 'Failed to complete onboarding session' }, { status: 500 });
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
    const trainingClass = Array.isArray(student.training_classes) ? student.training_classes[0] : student.training_classes;
    const trainingSite = Array.isArray(trainingClass?.training_sites) ? trainingClass.training_sites[0] : trainingClass?.training_sites;
    const instructor = Array.isArray(trainingClass?.instructors) ? trainingClass.instructors[0] : trainingClass?.instructors;
    const { subject, html } = buildOnboardingCompleteAdminEmail({
      full_name: student.full_name,
      email: student.email,
      school_name: student.school_name,
      instructor_name: student.instructor_name,
      instructor_contact: student.instructor_contact,
      class_name: trainingClass?.name ?? null,
      class_start_date: trainingClass?.class_start_date ?? null,
      ride_time_end_date: trainingClass?.ride_time_end_date ?? null,
      site_name: trainingSite?.name ?? trainingSite?.organization_name ?? null,
      selected_instructor_name: instructor ? `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() : null,
      selected_instructor_contact: instructor?.email ?? instructor?.mobile_phone ?? instructor?.business_phone ?? null,
    });
    try {
      await sendEmail({ to: admins.map((a: any) => a.email), subject, html });
    } catch {}
  }

  {
    const loginUrl = `${publicEnv.SITE_URL}/login`;
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
