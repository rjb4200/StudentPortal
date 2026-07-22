import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { calendarFeedEmailBody } from '@/lib/validation';
import { buildCalendarLinkEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';

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

  const parsed = calendarFeedEmailBody.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { feed_type, entity_id, recipient } = parsed.data;
  const supabase = createAdminClient();

  let query = supabase.from('calendar_feeds').select('*').eq('feed_type', feed_type);
  if (entity_id) {
    query = query.eq('entity_id', entity_id);
  } else {
    query = query.is('entity_id', null);
  }

  const { data: feed, error: feedError } = await query.maybeSingle();

  if (feedError) return NextResponse.json({ error: feedError.message }, { status: 500 });
  if (!feed?.token) return NextResponse.json({ error: 'No active calendar feed token exists. Generate one first.' }, { status: 400 });

  const feedUrl = `${publicEnv.SITE_URL}/api/calendar/${feed.token}.ics`;
  const { subject, html } = buildCalendarLinkEmail({ feedUrl });

  const result = await sendEmail({ to: recipient, subject, html });

  if (!result.ok) {
    console.error('Calendar link email failed:', result.error);
    return NextResponse.json({ error: 'Failed to send email. Check server logs for details.' }, { status: 500 });
  }

  const now = new Date().toISOString();
  await supabase
    .from('calendar_feeds')
    .update({ emailed_at: now })
    .eq('id', feed.id);

  return NextResponse.json({ success: true, emailed_at: now });
}
