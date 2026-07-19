import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieHeader.split(';').map((cookie) => { const [name, ...rest] = cookie.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();
  const { data: student } = await adminClient
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const { data: latestAdminMessage, error: messageError } = await adminClient
    .from('messages')
    .select('created_at')
    .eq('student_id', student.id)
    .eq('sender', 'admin')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 });
  if (!latestAdminMessage) return NextResponse.json({ acknowledged: false });

  const { error } = await adminClient.from('student_message_read_state').upsert({
    student_id: student.id,
    last_read_admin_message_at: latestAdminMessage.created_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'student_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ acknowledged: true, lastReadAdminMessageAt: latestAdminMessage.created_at });
}
