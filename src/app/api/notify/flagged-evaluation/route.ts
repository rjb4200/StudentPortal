import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { studentId, preceptorId, overallRating } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ data: student }, { data: preceptor }] = await Promise.all([
      supabase.from('students').select('full_name').eq('id', studentId).single(),
      supabase.from('preceptors').select('full_name').eq('id', preceptorId).single(),
    ]);

    const msg = `Student ${student?.full_name || studentId} submitted a low evaluation (${overallRating}/5) for preceptor ${preceptor?.full_name || preceptorId}. Review in the admin portal.`;

    if (process.env.PUSHOVER_APP_TOKEN && process.env.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: 'WFD EMS: Flagged Evaluation',
          message: msg,
          priority: 1,
        }),
      });
    }

    const { data: admins } = await supabase
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true)
      .eq('notify_evaluation_flagged', true);

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
          subject: 'WFD EMS: Flagged Evaluation',
          html: `<p>${msg}</p>`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
