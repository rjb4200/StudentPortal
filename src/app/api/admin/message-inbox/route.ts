import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { adminMessageThreadReadBody } from '@/lib/validation';

function createAuthClient(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  return createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieHeader.split(';').map((cookie) => { const [name, ...rest] = cookie.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} },
  });
}

async function getActiveAdminAccount(request: NextRequest) {
  const { data: { user } } = await createAuthClient(request).auth.getUser();
  if (!user || !canAccessAdmin(user)) return null;

  const adminClient = createAdminClient();
  const { data: adminAccount } = await adminClient
    .from('admin_accounts')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single();
  return adminAccount;
}

export async function GET(request: NextRequest) {
  const adminAccount = await getActiveAdminAccount(request);
  if (!adminAccount) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await createAdminClient()
    .rpc('get_admin_message_inbox', { p_admin_account_id: adminAccount.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ threads: data ?? [] });
}

export async function POST(request: NextRequest) {
  const adminAccount = await getActiveAdminAccount(request);
  if (!adminAccount) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = adminMessageThreadReadBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const adminClient = createAdminClient();
  const { data: latestStudentMessage, error: messageError } = await adminClient
    .from('messages')
    .select('created_at')
    .eq('student_id', parsed.data.studentId)
    .eq('sender', 'student')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 });
  if (!latestStudentMessage) return NextResponse.json({ acknowledged: false });

  const { error } = await adminClient.from('admin_message_thread_state').upsert({
    admin_account_id: adminAccount.id,
    student_id: parsed.data.studentId,
    last_read_student_message_at: latestStudentMessage.created_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'admin_account_id,student_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ acknowledged: true, lastReadStudentMessageAt: latestStudentMessage.created_at });
}
