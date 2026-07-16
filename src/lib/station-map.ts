import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { normalizeMapUrl } from '@/lib/station-map-url';

export { normalizeMapUrl } from '@/lib/station-map-url';

export async function getStationOneMapUrl(
  supabase: SupabaseClient<Database>,
  siteUrl: string
) {
  const { data, error } = await supabase
    .from('resource_documents')
    .select('file_url, map_embed_url, resource_categories!inner(name, is_active)')
    .ilike('name', 'Station 1%')
    .eq('is_active', true)
    .eq('resource_categories.name', 'Station Maps')
    .eq('resource_categories.is_active', true)
    .maybeSingle();

  if (error) throw error;
  return normalizeMapUrl(data?.file_url || data?.map_embed_url, siteUrl);
}
