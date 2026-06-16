import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { canAccessAdmin } from '@/lib/roles';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieHeader.split(';').map((c) => {
            const [name, ...rest] = c.trim().split('=');
            return { name, value: rest.join('=') };
          }),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!canAccessAdmin(user) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { flagId } = await request.json();
  if (!flagId) {
    return NextResponse.json({ error: 'flagId required' }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await adminClient
    .from('quiz_flags')
    .update({
      acknowledged: true,
      acknowledged_by: user!.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', flagId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
