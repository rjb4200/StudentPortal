import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildShiftApprovedEmail, buildShiftCancelledByAdminEmail, buildShiftRejectedEmail } from '@/lib/email-templates';
import { scheduleActionBody } from '@/lib/validation';
import { resolveCalendarFeedUrl } from '@/lib/calendar-feed-server';
import { getShiftKey } from '@/lib/shift-rotation';

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
  const { scheduleId, action, note, preceptorId } = parsed.data;
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

  // Optional preceptor pairing on approval.
  const assigningPreceptor = resolvedAction === 'approved' && !!preceptorId;
  let preceptorName: string | null = null;

  if (assigningPreceptor) {
    const { data: preceptor } = await adminClient
      .from('preceptors')
      .select('id, full_name, shift, is_active')
      .eq('id', preceptorId)
      .single();

    if (!preceptor || !preceptor.is_active || preceptor.shift !== getShiftKey(schedule.date)) {
      return NextResponse.json({ error: 'That preceptor is not available on this date.' }, { status: 400 });
    }

    const { data: alreadyPaired } = await adminClient
      .from('schedules')
      .select('id')
      .eq('date', schedule.date)
      .eq('preceptor_id', preceptorId)
      .neq('id', scheduleId)
      .maybeSingle();

    if (alreadyPaired) {
      return NextResponse.json({ error: 'That preceptor is already assigned to another student on this date.' }, { status: 400 });
    }

    preceptorName = preceptor.full_name;
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
    if (!updateError && assigningPreceptor) {
      await adminClient.from('schedules').update({ preceptor_id: preceptorId }).eq('id', scheduleId);
    }
  } else {
    const updatePayload: Record<string, unknown> = isProcessingStudentCancellation
      ? { cancelled_by: 'admin' }
      : { status: resolvedAction, ...(resolvedAction === 'cancelled' ? { cancelled_by: 'admin' } : {}) };

    if (resolvedAction === 'cancelled' && note) {
      updatePayload.cancel_note = note;
    }
    if (assigningPreceptor) {
      updatePayload.preceptor_id = preceptorId;
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

  // Soft capacity warning: more approved students than preceptors on duty.
  let warning: string | null = null;
  if (resolvedAction === 'approved') {
    const [{ count: approvedCount }, { count: poolCount }] = await Promise.all([
      adminClient.from('schedules').select('id', { count: 'exact', head: true }).eq('date', schedule.date).eq('status', 'approved'),
      adminClient.from('preceptors').select('id', { count: 'exact', head: true }).eq('shift', getShiftKey(schedule.date)).eq('is_active', true),
    ]);
    if ((approvedCount ?? 0) > (poolCount ?? 0)) {
      warning = `${approvedCount} students are approved on ${schedule.date}, but only ${poolCount ?? 0} preceptor${(poolCount ?? 0) === 1 ? ' is' : 's are'} on duty that day.`;
    }
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

      const feedUrl = await resolveCalendarFeedUrl('student', schedule.student_id).catch(() => null);

      const templateParams = { full_name: student.full_name, date_str: dateStr, time_display: timeDisplay, feedUrl };
      let result;

      if (resolvedAction === 'approved') {
        result = buildShiftApprovedEmail({ ...templateParams, login_url: loginUrl, preceptor_name: preceptorName });
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

  return NextResponse.json({ success: true, warning });
}
