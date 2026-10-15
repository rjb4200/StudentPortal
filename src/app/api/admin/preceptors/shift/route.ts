import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { preceptorShiftBody } from '@/lib/validation';

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

export async function POST(request: NextRequest) {
  const { data: { user } } = await createAuthClient(request).auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = preceptorShiftBody.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from('preceptors')
    .update({ shift: parsed.data.shift })
    .eq('id', parsed.data.preceptorId)
    .select('id, shift')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Preceptor not found' }, { status: 404 });

  return NextResponse.json({ success: true, preceptor: data });
}
