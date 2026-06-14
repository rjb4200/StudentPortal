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

    let authCreated = false;

    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email === student.email);

      if (!existing) {
        await supabase.auth.admin.createUser({
          email: student.email,
          email_confirm: true,
          user_metadata: { role: 'student' },
        });
        authCreated = true;
      }

      const { data: authUser } = await supabase.auth.admin.listUsers();
      const authMatch = authUser?.users?.find((u) => u.email === student.email);
      if (authMatch && authMatch.id !== studentId) {
        await supabase.from('students').update({ id: authMatch.id }).eq('id', studentId);
      }

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp?redirect_to=${request.nextUrl.origin}/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email: student.email,
          create_user: false,
          data: {},
          gotrue_meta_security: {},
        }),
      });
    } catch (e) {
      console.error('Auth/magic link error:', e);
    }

    // Notify admins with onboarding_complete preference
    const { data: admins } = await supabase
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true)
      .eq('notify_onboarding_complete', true);

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

    return NextResponse.json({ success: true, authCreated });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
