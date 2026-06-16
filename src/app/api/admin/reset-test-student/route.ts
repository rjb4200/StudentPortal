import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

function parseCookies(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .map((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      return { name, value: rest.join('=') };
    })
    .filter((cookie) => cookie.name);
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => parseCookies(cookieHeader), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await request.json();
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const [{ data: students, error: studentLookupError }, { data: adminAccounts }, { data: preceptors }] = await Promise.all([
    adminClient
      .from('students')
      .select('id, auth_user_id, is_test_record')
      .ilike('email', normalizedEmail),
    adminClient
      .from('admin_accounts')
      .select('id')
      .ilike('email', normalizedEmail),
    adminClient
      .from('preceptors')
      .select('id')
      .ilike('email', normalizedEmail),
  ]);

  if (studentLookupError) return NextResponse.json({ error: studentLookupError.message }, { status: 400 });

  if (adminAccounts?.length || preceptors?.length) {
    return NextResponse.json({ error: 'Test reset blocked because this email belongs to an admin or preceptor account.' }, { status: 409 });
  }

  if (students?.some((student) => !student.is_test_record)) {
    return NextResponse.json({ error: 'Test reset blocked because this email has non-test student records.' }, { status: 409 });
  }

  const studentIds = students?.map((student) => student.id) ?? [];
  const linkedAuthUserIds = students?.map((student) => student.auth_user_id).filter(Boolean) ?? [];

  const { data: authUsers, error: authLookupError } = await adminClient.auth.admin.listUsers();
  if (authLookupError) return NextResponse.json({ error: authLookupError.message }, { status: 400 });

  const authUserIdsByEmail = authUsers.users
    .filter((authUser) => authUser.email?.toLowerCase() === normalizedEmail)
    .map((authUser) => authUser.id);

  const authUserIds = [...new Set([...linkedAuthUserIds, ...authUserIdsByEmail])] as string[];

  if (!studentIds.length && !authUserIds.length) {
    return NextResponse.json({ error: 'No test student records or auth users found for this email.' }, { status: 404 });
  }

  if (studentIds.length) {
    await adminClient.from('messages').delete().in('student_id', studentIds);
    await adminClient.from('evaluations').delete().in('student_id', studentIds);
    await adminClient.from('schedules').delete().in('student_id', studentIds);
    await adminClient.from('admin_notes').delete().in('student_id', studentIds);
    await adminClient.from('student_field_values').delete().in('student_id', studentIds);

    await adminClient
      .from('students')
      .update({ auth_user_id: null })
      .in('id', studentIds);
  }

  for (const authUserId of authUserIds) {
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(authUserId);
    if (deleteAuthError) return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
  }

  if (studentIds.length) {
    const { error: deleteError } = await adminClient
      .from('students')
      .delete()
      .in('id', studentIds);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    deleted: studentIds.length,
    deletedAuthUsers: authUserIds.length,
  });
}
