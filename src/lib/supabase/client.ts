import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { publicEnv } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY
  );
}
