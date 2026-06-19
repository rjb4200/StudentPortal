import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { buildEvaluationReceiptEmail } from '@/lib/email-templates';

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
      const { subject, html } = buildEvaluationReceiptEmail({ full_name: student.full_name });
      await sendEmail({
        from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
        to: student.email,
        subject,
        html,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
