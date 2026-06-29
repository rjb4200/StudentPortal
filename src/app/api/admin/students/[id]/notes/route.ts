import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

function parseCookies(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  return {
    getAll: () =>
      cookieHeader
        .split(';')
        .filter(Boolean)
        .map((c) => {
          const [name, ...rest] = c.trim().split('=');
          return { name, value: rest.join('=') };
        })
        .filter((cookie) => cookie.name),
    setAll: () => {},
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await params;

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: parseCookies(request) }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { note_text, priority } = await request.json();
  if (!note_text || typeof note_text !== 'string' || !note_text.trim()) {
    return NextResponse.json({ error: 'note_text required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('admin_notes')
    .insert({
      student_id: studentId,
      note_text: note_text.trim(),
      priority: priority === 'high_accessibility' ? 'high_accessibility' : 'normal',
    })
    .select('id, note_text, priority, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await params;
  const noteId = request.nextUrl.searchParams.get('noteId');

  if (!noteId) {
    return NextResponse.json({ error: 'noteId query parameter required' }, { status: 400 });
  }

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: parseCookies(request) }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('admin_notes')
    .delete()
    .eq('id', noteId)
    .eq('student_id', studentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
