import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { deleteStudentBody } from '@/lib/validation';

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
  const parsed = deleteStudentBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { studentId } = parsed.data;

  const adminClient = createAdminClient();

  const { data: student, error: studentError } = await adminClient
    .from('students')
    .select('id, auth_user_id, email')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  if (student.auth_user_id) {
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(student.auth_user_id);
    if (authDeleteError) {
      return NextResponse.json({ error: `Failed to delete auth user: ${authDeleteError.message}` }, { status: 500 });
    }
  }

  const { error: dbDeleteError } = await adminClient
    .from('students')
    .delete()
    .eq('id', studentId);

  if (dbDeleteError) {
    if (student.auth_user_id) {
      const { error: recreateError } = await adminClient.auth.admin.createUser({
        email: student.email,
        password: String(Math.floor(100000 + Math.random() * 900000)),
        email_confirm: true,
        user_metadata: { role: 'student' },
      });
      if (recreateError) {
        console.error(`CRITICAL: Failed to recreate auth user after failed student delete. Orphan auth user ID: ${student.auth_user_id}`);
        return NextResponse.json({ error: `Failed to delete student record and could not recreate auth user. Orphan auth ID: ${student.auth_user_id}. ${dbDeleteError.message}` }, { status: 500 });
      }
      return NextResponse.json({ error: `Failed to delete student record but auth user was recreated. ${dbDeleteError.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: `Failed to delete student record: ${dbDeleteError.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
