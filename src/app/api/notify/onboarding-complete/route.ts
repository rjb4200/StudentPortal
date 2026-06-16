import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env.server';

export async function POST(request: NextRequest) {
  try {
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

        if (createError) throw createError;
        authMatch = created.user;
        isNewAccount = true;
      }

      if (authMatch && student.auth_user_id !== authMatch.id) {
        const { error: linkError } = await supabase
          .from('students')
          .update({ auth_user_id: authMatch.id })
          .eq('id', studentId);

        if (linkError) throw linkError;
      }
    } catch (e) {
      console.error('Auth error during onboarding-complete:', e);
    }

    console.log('Onboarding complete auth result:', { isNewAccount, tempPassword: tempPassword ? '***' : null, email: student.email });

    const pushoverMsg = `New student completed onboarding: ${student.full_name} (${student.email}) from ${student.school_name}`;

    if (serverEnv.PUSHOVER_APP_TOKEN && serverEnv.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: serverEnv.PUSHOVER_APP_TOKEN,
          user: serverEnv.PUSHOVER_USER_KEY,
          title: 'WFD EMS: Onboarding Complete',
          message: pushoverMsg,
          priority: 1,
        }),
      });
    }

    const { data: admins } = await supabase
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true)
      .eq('notify_onboarding_complete', true);

    if (serverEnv.RESEND_API_KEY && admins?.length) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: admins.map((a: any) => a.email),
          subject: 'New Student Onboarding Complete',
          html: `<p>${pushoverMsg}</p><p>Review and approve in the admin portal.</p>`,
        }),
      });
      if (!res.ok) {
        console.error('Resend admin email failed:', res.status, await res.text());
      }
    }

    if (serverEnv.RESEND_API_KEY) {
      console.log('Sending student credential email to:', student.email, 'isNewAccount:', isNewAccount, 'hasPassword:', !!tempPassword);
      const loginUrl = `${request.nextUrl.origin}/login`;
      const passwordDisplay = `<div style="margin:20px 0;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px 0;color:#1C1C1E;font-size:14px;font-weight:700;">Your Login Credentials</p>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Username:</strong> ${student.email}</p>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Password:</strong> ${tempPassword || 'Use your existing WFD password'}</p>
            <p style="margin:12px 0 0 0;color:#6b7280;font-size:12px;">You will need these to log in once an administrator approves your account.</p>
          </div>`;

      const studentHtml = `<div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1C1C1E;">
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
              <h1 style="margin:0 0 12px 0;color:#1C1C1E;font-size:28px;line-height:1.25;font-weight:800;text-align:center;">Student Portal Login</h1>
              <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Thank you for registering with the WFD EMS Student Portal. Your account has been created and is pending administrative approval.</p>
              ${passwordDisplay}
              <div style="margin:30px 0;text-align:center;">
                <a href="${loginUrl}" style="display:inline-block;background:#B61C20;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;border:1px solid #8a1518;box-shadow:0 4px 12px rgba(182,28,32,0.25);">Go to Student Portal Login</a>
              </div>
              <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">You will be able to log in once an administrator approves your account. You will receive a confirmation email when approved.</p>
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

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: student.email,
          subject: 'WFD EMS Student Portal — Registration Complete',
          html: studentHtml,
        }),
      });
      if (!res.ok) {
        console.error('Resend student email failed:', res.status, await res.text());
      }
    }

    return NextResponse.json({ success: true, password: tempPassword, email: student.email, isNewAccount });
  } catch (e) {
    console.error('Onboarding complete error:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
