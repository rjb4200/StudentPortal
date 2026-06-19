import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { buildFlaggedEvaluationEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { studentId, preceptorId, overallRating } = await request.json();

    const supabase = createAdminClient();

    const [{ data: student }, { data: preceptor }] = await Promise.all([
      supabase.from('students').select('full_name').eq('id', studentId).single(),
      supabase.from('preceptors').select('full_name').eq('id', preceptorId).single(),
    ]);

    const { data: admins } = await supabase
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true)
      .eq('notify_evaluation_flagged', true);

    if (admins?.length) {
      const { subject, html } = buildFlaggedEvaluationEmail({
        student_name: student?.full_name || studentId,
        preceptor_name: preceptor?.full_name || preceptorId,
        overall_rating: overallRating,
      });
      await sendEmail({
        from: 'WFD EMS Portal <onboarding@winchesterfireems.com>',
        to: admins.map((a: any) => a.email),
        subject,
        html,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
