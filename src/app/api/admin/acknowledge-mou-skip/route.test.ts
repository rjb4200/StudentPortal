import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://example.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const skipId = '11111111-1111-4111-8111-111111111111';
let signedIn = true;
let updatePayload: any;

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: signedIn ? { id: 'admin-user' } : null } }) } }),
}));
vi.mock('@/lib/roles', () => ({ canAccessAdmin: (user: any) => Boolean(user) }));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: (table: string) => {
    const query: any = {
      select: () => query,
      eq: () => query,
      is: () => query,
      update: (payload: any) => { updatePayload = payload; return query; },
      single: async () => ({ data: table === 'admin_accounts' ? { id: 'admin-account' } : null, error: null }),
      maybeSingle: async () => ({ data: table === 'class_mou_skips' ? { id: skipId } : null, error: null }),
    };
    return query;
  } }),
}));

async function post(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/admin/acknowledge-mou-skip', {
    method: 'POST', headers: { cookie: 'sb=token' }, body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => { signedIn = true; updatePayload = null; });

describe('POST /api/admin/acknowledge-mou-skip', () => {
  it('records the dismissing admin and time', async () => {
    const response = await post({ skipId });
    expect(response.status).toBe(200);
    expect(updatePayload.dismissed_by).toBe('admin-account');
    expect(new Date(updatePayload.dismissed_at).getTime()).not.toBeNaN();
  });

  it('rejects unauthenticated requests and invalid IDs', async () => {
    signedIn = false;
    expect((await post({ skipId })).status).toBe(403);
    signedIn = true;
    expect((await post({ skipId: 'bad' })).status).toBe(400);
    expect(updatePayload).toBeNull();
  });
});
