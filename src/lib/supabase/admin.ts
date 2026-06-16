import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

export function createAdminClient() {
  return createClient<Database>(
    publicEnv.SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
