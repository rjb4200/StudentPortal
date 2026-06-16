import 'server-only';
import { required } from '@/lib/env';

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  PUSHOVER_APP_TOKEN: process.env.PUSHOVER_APP_TOKEN,
  PUSHOVER_USER_KEY: process.env.PUSHOVER_USER_KEY,
} as const;
