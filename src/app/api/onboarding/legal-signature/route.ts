import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { legalSignatureBody } from '@/lib/validation';
import { hashOnboardingToken } from '@/lib/onboarding-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = legalSignatureBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { studentId, fullName, onboardingToken, agreedDocumentIds } = parsed.data;

    const supabase = createAdminClient() as any;

    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('id, expires_at, completed_at')
      .eq('student_id', studentId)
      .eq('token_hash', hashOnboardingToken(onboardingToken))
      .maybeSingle();

    if (sessionError) {
      console.error('Onboarding session verification failed:', sessionError);
      return NextResponse.json({ success: false, error: 'Unable to verify onboarding session.' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ success: false, error: 'Your onboarding session could not be verified. Please restart registration or contact your instructor for help.' }, { status: 403 });
    }

    if (session.completed_at) {
      return NextResponse.json({ success: false, error: 'This onboarding session has already been completed.' }, { status: 409 });
    }

    if (new Date(session.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'Your onboarding session has expired. Please restart registration or contact your instructor for help.' }, { status: 403 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '0.0.0.0';

    const now = new Date().toISOString();

    const acceptanceRows = agreedDocumentIds.map((documentId: string) => ({
      student_id: studentId,
      document_id: documentId,
      accepted_at: now,
    }));

    const { error: insertError } = await supabase
      .from('student_legal_acceptances')
      .upsert(acceptanceRows, { onConflict: 'student_id, document_id' });

    if (insertError) {
      console.error('Failed to insert legal acceptances:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to record acceptances' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('students')
      .update({
        legal_signature: fullName.trim(),
        signature_ip: ip,
        signature_timestamp: now,
      })
      .eq('id', studentId);

    if (updateError) {
      console.error('Failed to update student signature:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to save signature' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Legal signature error:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
