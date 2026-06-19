import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
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

      let title: string;
      let bodyHtml: string;
      let subject: string;

      if (action === 'approved') {
        title = 'Shift Approved';
        subject = 'Shift Approved — WFD EMS Student Portal';
        bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift request has been <strong>approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${timeDisplay}</p>
           </div>`;
      } else if (action === 'cancelled') {
        title = 'Shift Cancelled';
        subject = 'Shift Cancelled — WFD EMS Student Portal';
        bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift has been <strong>cancelled</strong> by the EMS Training Division.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${timeDisplay}</p>
             ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Note:</strong> ${note}</p>` : ''}
           </div>
           <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Please contact the Training Division if you have questions.</p>`;
      } else {
        title = 'Shift Update';
        subject = 'Shift Request Update — WFD EMS Student Portal';
        bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift request was <strong>not approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${timeDisplay}</p>
           </div>
           <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Please contact your preceptor or the Training Major for more information.</p>`;
      }

      const html = buildEmailHtml(title, bodyHtml, loginUrl);

      try {
        await sendEmail({
          from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
          to: student.email,
          subject,
          html,
        });
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
