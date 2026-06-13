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
      .select('email, full_name')
      .eq('id', studentId)
      .single();

    if (student && process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
          to: student.email,
          subject: 'Evaluation Receipt — WFD EMS Student Portal',
          html: `<p>Hi ${student.full_name},</p><p>Your preceptor evaluation has been received. Thank you for your feedback.</p><p>— WFD Division of EMS</p>`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
