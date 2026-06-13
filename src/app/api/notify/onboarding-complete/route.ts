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

        const { data: authUser } = await supabase.auth.admin.listUsers();
        const created = authUser?.users?.find((u) => u.email === student.email);
        if (created) {
          await supabase.from('students').update({ id: created.id }).eq('id', studentId);
        }
      }

      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: student.email,
        options: {
          redirectTo: `${request.nextUrl.origin}/dashboard`,
        },
      });
    } catch (e) {
      // Auth creation or magic link failed — log but don't block
      console.error('Auth/magic link error:', e);
    }

    // Notify admin
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

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
          to: process.env.PUSHOVER_USER_KEY ? 'admin@wfd.gov' : 'rjb4200@gmail.com',
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
