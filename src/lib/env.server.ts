import 'server-only';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local or your Vercel project settings.`
    );
  }
  return value;
}

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: required(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  PUSHOVER_APP_TOKEN: process.env.PUSHOVER_APP_TOKEN,
  PUSHOVER_USER_KEY: process.env.PUSHOVER_USER_KEY,
} as const;
