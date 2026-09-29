import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { uuidSchema } from '@/lib/validation';
import { z } from 'zod';

const bodySchema = z.object({ skipId: uuidSchema });

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieHeader.split(';').filter(Boolean).map((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');
        return { name, value: rest.join('=') };
      }).filter((cookie) => cookie.name),
      setAll: () => {},
    },
  });

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid skipId required' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: admin, error: adminError } = await adminClient
    .from('admin_accounts')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single();
  if (adminError || !admin) {
    return NextResponse.json({ error: 'Admin account not found' }, { status: 403 });
  }

  const { data, error } = await adminClient
    .from('class_mou_skips')
    .update({ dismissed_at: new Date().toISOString(), dismissed_by: admin.id })
    .eq('id', parsed.data.skipId)
    .is('dismissed_at', null)
    .select('id')
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Undismissed MOU skip not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
