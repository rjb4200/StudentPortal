import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createOnboardingSession } from '@/lib/onboarding-session';
import { onboardingRegistrationBody, phoneSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = onboardingRegistrationBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { fullName, email, phone, schoolName, instructorName, instructorContact } = parsed.data;
    const normalizedPhone = phone?.trim() ?? '';
    if (normalizedPhone) {
      const phoneResult = phoneSchema.safeParse(normalizedPhone);
      if (!phoneResult.success) {
        return NextResponse.json({ success: false, error: phoneResult.error.issues[0].message }, { status: 400 });
      }
    }

    const supabase = createAdminClient();
    const { data: studentId, error: registrationError } = await (supabase as any).rpc(
      'register_onboarding_student',
      {
        p_full_name: fullName,
        p_email: email,
        p_phone: normalizedPhone,
        p_school_name: schoolName,
        p_instructor_name: instructorName,
        p_instructor_contact: instructorContact,
      }
    );

    if (registrationError || !studentId) {
      const message = registrationError?.message || 'Registration failed.';
      const status = registrationError?.code === '23505' ? 409 : 500;
      return NextResponse.json({ success: false, error: message }, { status });
    }

    const onboardingToken = await createOnboardingSession(supabase, studentId);
    return NextResponse.json({ success: true, studentId, onboardingToken });
  } catch (e) {
    console.error('Onboarding registration error:', e);
    return NextResponse.json({ success: false, error: 'Unable to complete registration.' }, { status: 500 });
  }
}
