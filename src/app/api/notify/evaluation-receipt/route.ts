import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildEvaluationReceiptEmail } from '@/lib/email-templates';

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
    const { studentId } = await request.json();

    const adminClient = createAdminClient();

    const { data: student } = await adminClient
      .from('students')
      .select('id, email, full_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (student.id !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subject, html } = buildEvaluationReceiptEmail({ full_name: student.full_name });
    await sendEmail({
      from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
      to: student.email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
