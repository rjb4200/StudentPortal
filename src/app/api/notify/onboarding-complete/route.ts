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
      .select('full_name, email, school_name')
      .eq('id', studentId)
      .single();

    if (student) {
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
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
