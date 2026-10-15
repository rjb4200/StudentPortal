import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } },
  );
  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminClient = createAdminClient();
  const [{ data: blocks, error: blockError }, { data: schedules, error: scheduleError }, { data: preceptors, error: preceptorError }] = await Promise.all([
    adminClient.from('schedule_blocks').select('date, reason').order('date'),
    adminClient.from('schedules').select('*, students(full_name, email)').order('date', { ascending: true }),
    adminClient.from('preceptors').select('id, full_name, shift, is_active').eq('is_active', true).order('full_name'),
  ]);
  const error = blockError || scheduleError || preceptorError;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks: blocks ?? [], schedules: schedules ?? [], preceptors: preceptors ?? [] });
}
