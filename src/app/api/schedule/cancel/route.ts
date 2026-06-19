import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { sendEmail, buildEmailHtml } from '@/lib/email';

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

  const { scheduleId, note } = await request.json();
  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId required' }, { status: 400 });
  }

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

  const loginUrl = `${request.nextUrl.origin}/dashboard`;
  const dateStr = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeDisplay = schedule.start_time && schedule.end_time
    ? `${schedule.start_time} – ${schedule.end_time}`
    : schedule.shift_type;

  {
    const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift has been <strong>cancelled</strong>.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${timeDisplay}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Status:</strong> Student-initiated</p>
        ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Note:</strong> ${note}</p>` : ''}
      </div>`;

    const html = buildEmailHtml('Shift Cancelled', bodyHtml, loginUrl);

    try {
      await sendEmail({
        from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
        to: student.email,
        subject: 'Shift Cancelled — WFD EMS Student Portal',
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
      const adminMsg = `<p>${student.full_name} has cancelled their shift.</p>
        <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${timeDisplay}</p>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Status:</strong> Student-initiated</p>
          ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Student note:</strong> ${note}</p>` : ''}
        </div>`;

      try {
        await sendEmail({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: admins.map((a: any) => a.email),
          subject: 'Student Shift Cancellation — WFD EMS',
          html: adminMsg,
        });
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
