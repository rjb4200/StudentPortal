import { NextRequest, NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

async function getAdminUser(request: NextRequest) {
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
  return user && canAccessAdmin(user) ? user : null;
}

export async function GET(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 8;
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 25) : 8;

  const { data, error } = await createAdminClient()
    .from('audit_log')
    .select('id, action, performed_by, timestamp')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) {
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
