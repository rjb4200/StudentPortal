import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { adminStudentSearchQuery } from '@/lib/validation';

function createAuthClient(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  return createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieHeader.split(';').map((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');
        return { name, value: rest.join('=') };
      }),
      setAll: () => {},
    },
  });
}

export async function GET(request: NextRequest) {
  const { data: { user } } = await createAuthClient(request).auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = adminStudentSearchQuery.safeParse({
    query: new URL(request.url).searchParams.get('query') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const search = parsed.data.query?.trim() ?? '';

  let query = createAdminClient()
    .from('students')
    .select('id, full_name, email, status')
    .eq('is_blacklisted', false);

  if (search) {
    const safe = search.replace(/[%,()*]/g, ' ').replace(/\s+/g, ' ').trim();
    if (safe) {
      query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }
  }

  const { data, error } = await query.order('full_name', { ascending: true }).limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ students: data ?? [] });
}
