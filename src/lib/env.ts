function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local or your Vercel project settings.`
    );
  }
  return value;
}

function appUrl(value: string | undefined): string {
  const url = required(value, 'NEXT_PUBLIC_SITE_URL').replace(/\/+$/, '');
  if (!/^https?:\/\//.test(url)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must include http:// or https://.');
  }
  return url;
}

export const publicEnv = {
  SUPABASE_URL: required(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SITE_URL: appUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;
