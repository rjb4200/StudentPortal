import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';

export async function resolveCalendarFeedUrl(
  feedType: 'student' | 'training_site' | 'aggregate',
  entityId: string | null,
): Promise<string | null> {
  const supabase = createAdminClient();
  const siteUrl = publicEnv.SITE_URL;

  let query = supabase.from('calendar_feeds').select('token').eq('feed_type', feedType);
  if (entityId) {
    query = query.eq('entity_id', entityId);
  } else {
    query = query.is('entity_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing?.token) {
    return `${siteUrl}/api/calendar/${existing.token}.ics`;
  }

  const newToken = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase
    .from('calendar_feeds')
    .insert({ feed_type: feedType, entity_id: entityId ?? null, token: newToken, generated_at: now });

  if (insertError) {
    const { data: retry } = await supabase
      .from('calendar_feeds')
      .select('token')
      .eq('feed_type', feedType)
      .is(entityId ? 'entity_id' : 'entity_id', null)
      .maybeSingle();
    if (retry?.token) {
      return `${siteUrl}/api/calendar/${retry.token}.ics`;
    }
    return null;
  }

  return `${siteUrl}/api/calendar/${newToken}.ics`;
}
