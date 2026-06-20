import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildShiftCancelledByStudentEmail, buildShiftCancelledByStudentAdminEmail } from '@/lib/email-templates';
import { scheduleCancelBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = scheduleCancelBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { scheduleId, note } = parsed.data;

  const adminClient = createAdminClient();

  const { data: student } = await adminClient
    .from('students')
    .select('id, full_name, email')
    .eq('auth_user_id', user.id)
    .single();

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const { data: schedule } = await adminClient
    .from('schedules')
    .select('id, student_id, date, shift_type, start_time, end_time, status')
    .eq('id', scheduleId)
    .single();

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  if (schedule.student_id !== student.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (schedule.status === 'cancelled' || schedule.status === 'rejected') {
    return NextResponse.json({ success: true, message: 'Already in terminal state' });
  }

  const wasApproved = schedule.status === 'approved';

  const { error: updateError } = await adminClient
    .from('schedules')
    .update({
      status: 'cancelled',
      cancel_note: note || null,
      ...(wasApproved ? { cancelled_by: 'student' } : {}),
    })
    .eq('id', scheduleId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const loginUrl = `${publicEnv.SITE_URL}/dashboard`;
  const dateStr = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeDisplay = schedule.start_time && schedule.end_time
    ? `${schedule.start_time} – ${schedule.end_time}`
    : schedule.shift_type;

  {
    const { subject, html } = buildShiftCancelledByStudentEmail({
      full_name: student.full_name,
      date_str: dateStr,
      time_display: timeDisplay,
      note: note || null,
      login_url: loginUrl,
    });
    try {
      await sendEmail({
        from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
        to: student.email,
        subject,
        html,
      });
    } catch {}
  }

  {
    const { data: admins } = await adminClient
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true);

    if (admins?.length) {
      const { subject, html } = buildShiftCancelledByStudentAdminEmail({
        full_name: student.full_name,
        date_str: dateStr,
        time_display: timeDisplay,
        note: note || null,
      });
      try {
        await sendEmail({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: admins.map((a: any) => a.email),
          subject,
          html,
        });
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
