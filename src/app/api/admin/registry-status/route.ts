import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';
import { registryStatusBody } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { buildInstructorClassApprovedEmail } from '@/lib/email-templates';

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = registryStatusBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { table, id, status } = parsed.data;
  const adminClient = createAdminClient() as any;
  let classApprovalEmail: {
    instructorEmail: string;
    instructorName: string;
    className: string;
    classStartDate: string;
    rideTimeEndDate: string;
    siteName: string | null;
  } | null = null;

  if (table === 'training_classes' && status === 'active') {
    const { data: existingClass, error: existingClassError } = await adminClient
      .from('training_classes')
      .select('status, name, class_start_date, ride_time_end_date, instructors(first_name, last_name, email), training_sites(name)')
      .eq('id', id)
      .single();

    if (existingClassError) {
      console.error('Unable to load class before approval notification:', existingClassError.message);
    } else if (existingClass?.status !== 'active') {
      const instructor = firstRelation(existingClass.instructors);
      const site = firstRelation(existingClass.training_sites);
      if (instructor?.email) {
        classApprovalEmail = {
          instructorEmail: instructor.email,
          instructorName: `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() || 'Instructor',
          className: existingClass.name,
          classStartDate: existingClass.class_start_date,
          rideTimeEndDate: existingClass.ride_time_end_date,
          siteName: site?.name ?? null,
        };
      }
    }
  }

  const payload: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (status === 'active') {
    payload.approved_by = user?.id ?? null;
    payload.approved_at = new Date().toISOString();
  }

  const { error } = await adminClient.from(table).update(payload).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (classApprovalEmail) {
    const { subject, html } = buildInstructorClassApprovedEmail({
      instructor_name: classApprovalEmail.instructorName,
      class_name: classApprovalEmail.className,
      class_start_date: classApprovalEmail.classStartDate,
      ride_time_end_date: classApprovalEmail.rideTimeEndDate,
      site_name: classApprovalEmail.siteName,
    });
    const emailResult = await sendEmail({ to: classApprovalEmail.instructorEmail, subject, html });
    if (!emailResult.ok) {
      console.error(`Instructor class approval email failed for class ${id}: ${emailResult.error ?? 'Unknown error'}`);
    }
  }

  return NextResponse.json({ success: true });
}
