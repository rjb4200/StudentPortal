import { NextRequest, NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
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

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action } = await request.json();
  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'action required' }, { status: 400 });
  }

  const performedBy = user.email || user.id || 'unknown';
  await auditLog(action, performedBy);

  return NextResponse.json({ success: true });
}
