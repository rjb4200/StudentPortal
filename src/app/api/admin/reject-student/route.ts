import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import {
  buildStudentRejectionEmail,
  buildInstructorRejectionEmail,
  buildAdminRejectionNotification,
} from '@/lib/email-templates';

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return (value as T[])[0] ?? null;
  return (value as T) ?? null;
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () =>
          cookieHeader.split(';').map((c) => {
            const [name, ...rest] = c.trim().split('=');
            return { name, value: rest.join('=') };
          }),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId, reason } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
  }

  const adminClient = createAdminClient() as any;

  const { data: student, error: studentError } = await adminClient
    .from('students')
    .select(
      'email, full_name, phone, school_name, status, onboarding_completed_at, auth_user_id, instructor_name, instructor_contact, training_classes(name, level, class_start_date, ride_time_end_date, training_sites(name), instructors(first_name, last_name, email))'
    )
    .eq('id', studentId)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  if (student.status !== 'pending') {
    return NextResponse.json({ success: true, message: 'Student is not pending' });
  }
  if (!student.onboarding_completed_at) {
    return NextResponse.json({ error: 'Student has not completed onboarding.' }, { status: 400 });
  }

  if (student.auth_user_id) {
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(student.auth_user_id);
    if (authDeleteError) {
      return NextResponse.json(
        { error: `Failed to delete auth user: ${authDeleteError.message}` },
        { status: 500 }
      );
    }
  }

  const rejectTimestamp = new Date().toISOString();
  const rejectedBy = user?.email || user?.id || 'unknown';

  const { error: updateError } = await adminClient
    .from('students')
    .update({
      status: 'rejected',
      rejection_reason: reason.trim(),
      rejected_at: rejectTimestamp,
      rejected_by: rejectedBy,
    })
    .eq('id', studentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const trainingClass = firstRelation(student.training_classes);
  const trainingSite = trainingClass ? firstRelation(trainingClass.training_sites) : null;
  const instructor = trainingClass ? firstRelation(trainingClass.instructors) : null;

  const siteUrl = publicEnv.SITE_URL || '';

  // Student email
  {
    const { subject, html } = buildStudentRejectionEmail({
      full_name: student.full_name,
      reason: reason.trim(),
      site_url: siteUrl,
    });
    try {
      await sendEmail({ to: student.email, subject, html });
    } catch (e) {
      console.error('Student rejection email failed:', e);
    }
  }

  // Instructor email
  {
    const instructorName = instructor
      ? `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim()
      : (student.instructor_name ?? null);

    if (instructor?.email) {
      const { subject, html } = buildInstructorRejectionEmail({
        instructor_name: instructorName || 'Instructor',
        student_name: student.full_name,
        class_name: trainingClass?.name ?? null,
        reason: reason.trim(),
      });
      try {
        await sendEmail({ to: instructor.email, subject, html });
      } catch (e) {
        console.error('Instructor rejection email failed:', e);
      }
    }
  }

  // Admin notification email
  {
    const { subject, html } = buildAdminRejectionNotification({
      student_name: student.full_name,
      student_email: student.email,
      student_phone: student.phone ?? null,
      school_name: student.school_name,
      class_name: trainingClass?.name ?? null,
      class_start_date: trainingClass?.class_start_date ?? null,
      ride_time_end_date: trainingClass?.ride_time_end_date ?? null,
      site_name: trainingSite?.name ?? null,
      instructor_name: instructor
        ? `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim()
        : (student.instructor_name ?? null),
      instructor_contact: instructor?.email ?? student.instructor_contact ?? null,
      reason: reason.trim(),
      rejected_by: rejectedBy,
    });
    try {
      await sendEmail({ to: rejectedBy, subject, html });
    } catch (e) {
      console.error('Admin rejection notification email failed:', e);
    }
  }

  return NextResponse.json({ success: true });
}
