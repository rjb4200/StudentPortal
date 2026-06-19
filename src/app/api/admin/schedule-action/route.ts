import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildShiftApprovedEmail, buildShiftCancelledByAdminEmail, buildShiftRejectedEmail } from '@/lib/email-templates';

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

  const { scheduleId, action, note } = await request.json();
  if (!scheduleId || !action || !['approved', 'rejected', 'cancelled'].includes(action)) {
    return NextResponse.json({ error: 'scheduleId and action (approved|rejected|cancelled) required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: schedule } = await adminClient
    .from('schedules')
    .select('id, student_id, date, shift_type, start_time, end_time, status')
    .eq('id', scheduleId)
    .single();

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  const isProcessingStudentCancellation = schedule.status === 'cancelled' && action === 'cancelled';

  if (schedule.status === 'rejected') {
    return NextResponse.json({ success: true, message: 'Already rejected' });
  }

  if (schedule.status === 'cancelled' && !isProcessingStudentCancellation) {
    return NextResponse.json({ success: true, message: 'Already cancelled' });
  }

  const updatePayload = isProcessingStudentCancellation
    ? { cancelled_by: 'admin' as const }
    : { status: action, ...(action === 'cancelled' ? { cancelled_by: 'admin' as const } : {}) };

  if (action === 'cancelled' && note) {
    (updatePayload as any).cancel_note = note;
  }

  const { error: updateError } = await adminClient
    .from('schedules')
    .update(updatePayload as any)
    .eq('id', scheduleId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!isProcessingStudentCancellation) {
    const { data: student } = await adminClient
      .from('students')
      .select('email, full_name')
      .eq('id', schedule.student_id)
      .single();

    if (student) {
      const loginUrl = `${request.nextUrl.origin}/dashboard`;
      const dateStr = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const timeDisplay = schedule.start_time && schedule.end_time
        ? `${schedule.start_time} – ${schedule.end_time}`
        : schedule.shift_type;

      const templateParams = { full_name: student.full_name, date_str: dateStr, time_display: timeDisplay };
      let result;

      if (action === 'approved') {
        result = buildShiftApprovedEmail({ ...templateParams, login_url: loginUrl });
      } else if (action === 'cancelled') {
        result = buildShiftCancelledByAdminEmail({ ...templateParams, note: note || null, login_url: loginUrl });
      } else {
        result = buildShiftRejectedEmail({ ...templateParams, login_url: loginUrl });
      }

      try {
        await sendEmail({
          from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
          to: student.email,
          subject: result.subject,
          html: result.html,
        });
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
