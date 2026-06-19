import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, buildEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    const supabase = createAdminClient();

    const { data: student } = await supabase
      .from('students')
      .select('email, full_name')
      .eq('id', studentId)
      .single();

    if (student) {
      await sendEmail({
        from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
        to: student.email,
        subject: 'Evaluation Receipt — WFD EMS Student Portal',
        html: buildEmailHtml(
          'Evaluation Receipt',
          `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${student.full_name},</p><p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Your preceptor evaluation has been received. Thank you for your feedback.</p>`
        ),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
