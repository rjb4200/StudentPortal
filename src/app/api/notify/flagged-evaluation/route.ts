import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildFlaggedEvaluationEmail } from '@/lib/email-templates';
import { queueAdminSmsAlerts } from '@/lib/notifications/sms-queue';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { studentId, preceptorId, overallRating } = await request.json();

    const adminClient = createAdminClient();

    const { data: student } = await adminClient
      .from('students')
      .select('id, full_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (student.id !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: preceptor } = await adminClient
      .from('preceptors')
      .select('full_name')
      .eq('id', preceptorId)
      .single();

    const { data: admins } = await adminClient
      .from('admin_accounts')
      .select('email')
      .eq('is_active', true)
      .eq('notify_evaluation_flagged', true);

    if (admins?.length) {
      const { subject, html } = buildFlaggedEvaluationEmail({
        student_name: student.full_name,
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

    try {
      const smsResults = await queueAdminSmsAlerts(adminClient, {
        notificationType: 'admin_flagged_evaluation',
        messageBody: `WFD EMS Student Portal: A flagged evaluation was submitted by ${student.full_name}. Review in the admin portal.`,
        preferenceColumn: 'notify_sms_evaluation_flagged',
      });
      for (const smsResult of smsResults) {
        if (!smsResult.ok) console.error('Failed to queue flagged evaluation admin SMS:', smsResult.error);
      }
    } catch (e) {
      console.error('Failed to queue flagged evaluation admin SMS:', e);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
