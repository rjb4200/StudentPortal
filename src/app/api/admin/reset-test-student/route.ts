import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await request.json();
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: students, error: lookupError } = await adminClient
    .from('students')
    .select('id, auth_user_id, is_test_record')
    .ilike('email', normalizedEmail);

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 });
  if (!students?.length) return NextResponse.json({ error: 'No student records found for this email.' }, { status: 404 });

  if (students.some((student) => !student.is_test_record)) {
    return NextResponse.json({ error: 'Test reset blocked because this email has non-test student records.' }, { status: 409 });
  }

  const studentIds = students.map((student) => student.id);
  const authUserIds = [...new Set(students.map((student) => student.auth_user_id).filter(Boolean))] as string[];

  await adminClient.from('messages').delete().in('student_id', studentIds);
  await adminClient.from('evaluations').delete().in('student_id', studentIds);
  await adminClient.from('schedules').delete().in('student_id', studentIds);
  await adminClient.from('admin_notes').delete().in('student_id', studentIds);
  await adminClient.from('student_field_values').delete().in('student_id', studentIds);

  await adminClient
    .from('students')
    .update({ auth_user_id: null })
    .in('id', studentIds);

  for (const authUserId of authUserIds) {
    await adminClient.auth.admin.deleteUser(authUserId);
  }

  const { error: deleteError } = await adminClient
    .from('students')
    .delete()
    .in('id', studentIds);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  return NextResponse.json({ success: true, deleted: studentIds.length });
}
