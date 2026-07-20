import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildShiftApprovedEmail, buildShiftCancelledByAdminEmail, buildShiftRejectedEmail } from '@/lib/email-templates';
import { scheduleActionBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = scheduleActionBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { scheduleId, action, note } = parsed.data;
  const isCombinedAction = action === 'approved_and_blocked' || action === 'rejected_and_blocked';
  const resolvedAction = action === 'approved_and_blocked'
    ? 'approved'
    : action === 'rejected_and_blocked'
      ? 'rejected'
      : action;

  const adminClient = createAdminClient();

  const { data: schedule } = await adminClient
    .from('schedules')
    .select('id, student_id, date, shift_type, start_time, end_time, status')
    .eq('id', scheduleId)
    .single();

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  const isProcessingStudentCancellation = schedule.status === 'cancelled' && resolvedAction === 'cancelled';

  if (schedule.status === 'rejected') {
    return NextResponse.json({ success: true, message: 'Already rejected' });
  }

  if (schedule.status === 'cancelled' && !isProcessingStudentCancellation) {
    return NextResponse.json({ success: true, message: 'Already cancelled' });
  }

  let updateError: { message: string } | null = null;
  if (isCombinedAction) {
    const { error } = await adminClient.rpc('resolve_schedule_and_block_day', {
      p_schedule_id: scheduleId,
      p_action: resolvedAction as 'approved' | 'rejected',
      p_reason: note || '',
      p_admin_id: user.id,
    });
    updateError = error;
  } else {
    const updatePayload = isProcessingStudentCancellation
      ? { cancelled_by: 'admin' as const }
      : { status: resolvedAction, ...(resolvedAction === 'cancelled' ? { cancelled_by: 'admin' as const } : {}) };

    if (resolvedAction === 'cancelled' && note) {
      (updatePayload as any).cancel_note = note;
    }

    const { error } = await adminClient
      .from('schedules')
      .update(updatePayload as any)
      .eq('id', scheduleId);
    updateError = error;
  }

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
      const loginUrl = `${publicEnv.SITE_URL}/dashboard`;
      const dateStr = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const timeDisplay = schedule.start_time && schedule.end_time
        ? `${schedule.start_time} – ${schedule.end_time}`
        : schedule.shift_type;

      const templateParams = { full_name: student.full_name, date_str: dateStr, time_display: timeDisplay };
      let result;

      if (resolvedAction === 'approved') {
        result = buildShiftApprovedEmail({ ...templateParams, login_url: loginUrl });
      } else if (resolvedAction === 'cancelled') {
        result = buildShiftCancelledByAdminEmail({ ...templateParams, note: note || null, login_url: loginUrl });
      } else {
        result = buildShiftRejectedEmail({ ...templateParams, login_url: loginUrl });
      }

      try {
        await sendEmail({
          to: student.email,
          subject: result.subject,
          html: result.html,
        });
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
