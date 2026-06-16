import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

function buildEmailHtml(title: string, bodyHtml: string, loginUrl: string): string {
  return `<div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1C1C1E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;margin:0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,0.10);">
          <tr>
            <td style="background:#A40104;padding:30px 28px 26px 28px;text-align:center;border-bottom:6px solid #1C1C1E;">
              <img src="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg" alt="Winchester Fire Department" width="150" style="display:block;margin:0 auto 18px auto;width:150px;max-width:150px;height:auto;border:0;" />
              <div style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff;font-weight:700;">Winchester Fire Department</div>
              <div style="margin-top:8px;font-size:26px;line-height:1.2;color:#ffffff;font-weight:800;">Division of EMS</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 34px 16px 34px;">
              <h1 style="margin:0 0 12px 0;color:#1C1C1E;font-size:28px;line-height:1.25;font-weight:800;text-align:center;">${title}</h1>
              ${bodyHtml}
              <div style="margin:30px 0;text-align:center;">
                <a href="${loginUrl}" style="display:inline-block;background:#A40104;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;border:1px solid #8a1518;box-shadow:0 4px 12px rgba(164,1,4,0.25);">View Your Dashboard</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 34px 32px 34px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0 18px 0;" />
              <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;text-align:center;">Winchester Fire Department — Division of EMS<br />EMS Student Training & Rotation Portal</p>
            </td>
          </tr>
        </table>
        <p style="max-width:640px;margin:16px auto 0 auto;color:#9ca3af;font-size:11px;line-height:1.5;text-align:center;">This is an automated message from the WFD EMS Student Portal.</p>
      </td>
    </tr>
  </table>
</div>`;
}

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

  const { scheduleId, action } = await request.json();
  if (!scheduleId || !action || !['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'scheduleId and action (approved|rejected) required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: schedule } = await adminClient
    .from('schedules')
    .select('id, student_id, date, shift_type, status')
    .eq('id', scheduleId)
    .single();

  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  if (schedule.status !== 'pending') {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }

  const { error: updateError } = await adminClient
    .from('schedules')
    .update({ status: action })
    .eq('id', scheduleId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (serverEnv.RESEND_API_KEY) {
    const { data: student } = await adminClient
      .from('students')
      .select('email, full_name')
      .eq('id', schedule.student_id)
      .single();

    if (student) {
      const loginUrl = `${request.nextUrl.origin}/dashboard`;
      const dateStr = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const isApproved = action === 'approved';
      const title = isApproved ? 'Shift Approved' : 'Shift Update';
      const bodyHtml = isApproved
        ? `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift request has been <strong>approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Shift:</strong> ${schedule.shift_type}</p>
           </div>`
        : `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name}, your shift request was <strong>not approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${dateStr}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Shift:</strong> ${schedule.shift_type}</p>
           </div>
           <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Please contact your preceptor or the Training Major for more information.</p>`;

      const html = buildEmailHtml(title, bodyHtml, loginUrl);

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
          to: student.email,
          subject: isApproved ? 'Shift Approved — WFD EMS Student Portal' : 'Shift Request Update — WFD EMS Student Portal',
          html,
        }),
      });
    }
  }

  return NextResponse.json({ success: true });
}
