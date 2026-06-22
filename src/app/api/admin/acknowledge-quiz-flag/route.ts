import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () =>
          cookieHeader
            .split(';')
            .filter(Boolean)
            .map((c) => {
              const [name, ...rest] = c.trim().split('=');
              return { name, value: rest.join('=') };
            })
            .filter((cookie) => cookie.name),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { flagId } = await request.json();
  if (!flagId) {
    return NextResponse.json({ error: 'flagId required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: adminAccount } = await adminClient
    .from('admin_accounts')
    .select('id')
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email ?? ''}`)
    .eq('is_active', true)
    .maybeSingle();

  const { error } = await adminClient
    .from('quiz_flags')
    .update({
      acknowledged: true,
      acknowledged_by: adminAccount?.id ?? null,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', flagId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
