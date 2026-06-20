import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { legalSignatureBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = legalSignatureBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { studentId, fullName, agreedDocumentIds } = parsed.data;

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '0.0.0.0';

    const now = new Date().toISOString();

    const supabase = createAdminClient();

    const acceptanceRows = agreedDocumentIds.map((documentId: string) => ({
      student_id: studentId,
      document_id: documentId,
      accepted_at: now,
    }));

    const { error: insertError } = await supabase
      .from('student_legal_acceptances')
      .insert(acceptanceRows);

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
