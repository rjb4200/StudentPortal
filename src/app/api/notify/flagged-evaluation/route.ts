import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env.server';

export async function POST(request: NextRequest) {
  try {
    const { studentId, preceptorId, overallRating } = await request.json();

    const supabase = createAdminClient();

    const [{ data: student }, { data: preceptor }] = await Promise.all([
      supabase.from('students').select('full_name').eq('id', studentId).single(),
      supabase.from('preceptors').select('full_name').eq('id', preceptorId).single(),
    ]);

    const msg = `Student ${student?.full_name || studentId} submitted a low evaluation (${overallRating}/5) for preceptor ${preceptor?.full_name || preceptorId}. Review in the admin portal.`;

    if (serverEnv.PUSHOVER_APP_TOKEN && serverEnv.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: serverEnv.PUSHOVER_APP_TOKEN,
          user: serverEnv.PUSHOVER_USER_KEY,
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

    if (serverEnv.RESEND_API_KEY && admins?.length) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
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
