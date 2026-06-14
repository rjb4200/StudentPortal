import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: student } = await supabase
      .from('students')
      .select('id, full_name, email, school_name')
      .eq('id', studentId)
      .single();

    if (!student) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    let tempPassword: string | null = null;

    try {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find((u) => u.email === student.email);

      if (!found) {
        tempPassword = String(Math.floor(100000 + Math.random() * 900000));
        await supabase.auth.admin.createUser({
          email: student.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { role: 'student' },
        });
      }

      const { data: authUser } = await supabase.auth.admin.listUsers();
      const authMatch = authUser?.users?.find((u) => u.email === student.email);
      if (authMatch && authMatch.id !== studentId) {
        await supabase.from('students').update({ id: authMatch.id }).eq('id', studentId);
      }
    } catch (e) {
      console.error('Auth error:', e);
    }

    const pushoverMsg = `New student completed onboarding: ${student.full_name} (${student.email}) from ${student.school_name}`;

    if (process.env.PUSHOVER_APP_TOKEN && process.env.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
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

    if (process.env.RESEND_API_KEY && admins?.length) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: admins.map((a: any) => a.email),
          subject: 'New Student Onboarding Complete',
          html: `<p>${pushoverMsg}</p><p>Review and approve in the admin portal.</p>`,
        }),
      });
    }

    return NextResponse.json({ success: true, password: tempPassword });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
