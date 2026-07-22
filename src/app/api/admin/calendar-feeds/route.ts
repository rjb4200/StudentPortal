import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { calendarFeedBody } from '@/lib/validation';

async function getAdmin(request: NextRequest) {
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
    },
  );
  const { data: { user } } = await authClient.auth.getUser();
  return canAccessAdmin(user) ? user : null;
}

export async function POST(request: NextRequest) {
  const user = await getAdmin(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = calendarFeedBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { feed_type, entity_id } = parsed.data;
  const supabase = createAdminClient();
  const newToken = crypto.randomUUID();
  const now = new Date().toISOString();

  // Manual upsert: onConflict can't use expression-based unique indexes
  let query = supabase.from('calendar_feeds').select('id, token').eq('feed_type', feed_type);
  if (entity_id) {
    query = query.eq('entity_id', entity_id);
  } else {
    query = query.is('entity_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('calendar_feeds')
      .update({ token: newToken, generated_at: now })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const feedUrl = `${publicEnv.SITE_URL}/api/calendar/${newToken}.ics`;
    return NextResponse.json({ success: true, feed: data, feedUrl });
  }

  const { data, error } = await supabase
    .from('calendar_feeds')
    .insert({ feed_type, entity_id: entity_id ?? null, token: newToken, generated_at: now })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const feedUrl = `${publicEnv.SITE_URL}/api/calendar/${newToken}.ics`;
  return NextResponse.json({ success: true, feed: data, feedUrl });
}

export async function DELETE(request: NextRequest) {
  const user = await getAdmin(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = calendarFeedBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { feed_type, entity_id } = parsed.data;
  const supabase = createAdminClient();

  let query = supabase
    .from('calendar_feeds')
    .update({ token: null, generated_at: null })
    .eq('feed_type', feed_type);

  if (entity_id) {
    query = query.eq('entity_id', entity_id);
  } else {
    query = query.is('entity_id', null);
  }

  const { error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const user = await getAdmin(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const feedType = url.searchParams.get('feed_type');
  const entityId = url.searchParams.get('entity_id');

  if (!feedType) return NextResponse.json({ error: 'feed_type query parameter is required' }, { status: 400 });

  const supabase = createAdminClient();
  let query = supabase.from('calendar_feeds').select('*').eq('feed_type', feedType as 'student' | 'training_site' | 'aggregate');

  if (entityId) {
    query = query.eq('entity_id', entityId);
  } else {
    query = query.is('entity_id', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const feedUrl = data?.token ? `${publicEnv.SITE_URL}/api/calendar/${data.token}.ics` : null;
  return NextResponse.json({ feed: data ?? null, feedUrl });
}
