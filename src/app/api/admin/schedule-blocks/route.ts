import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { scheduleBlockBody, scheduleBlockDeleteBody, scheduleBlockRangeBody } from '@/lib/validation';

async function getAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } },
  );
  const { data: { user } } = await authClient.auth.getUser();
  return canAccessAdmin(user) ? user : null;
}

export async function GET(request: NextRequest) {
  if (!await getAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data, error } = await createAdminClient().from('schedule_blocks').select('*').order('date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await getAdmin(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();

  if (typeof body === 'object' && body !== null && 'startDate' in body) {
    const parsedRange = scheduleBlockRangeBody.safeParse(body);
    if (!parsedRange.success) return NextResponse.json({ error: parsedRange.error.issues[0].message }, { status: 400 });

    const { data, error } = await createAdminClient().rpc('block_schedule_date_range', {
      p_start_date: parsedRange.data.startDate,
      p_end_date: parsedRange.data.endDate,
      p_reason: parsedRange.data.reason?.trim() || '',
      p_admin_id: user.id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, range: data?.[0] });
  }

  const parsed = scheduleBlockBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const reason = parsed.data.reason?.trim() || null;
  const { data, error } = await createAdminClient()
    .from('schedule_blocks')
    .upsert({ date: parsed.data.date, reason, created_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, block: data });
}

export async function DELETE(request: NextRequest) {
  if (!await getAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = scheduleBlockDeleteBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { error } = await createAdminClient().from('schedule_blocks').delete().eq('date', parsed.data.date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
