import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let isAdmin = true;
let updatePayload: any;
let found: any = { id: '11111111-1111-4111-8111-111111111111', shift: 'second' };

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })) } }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => isAdmin }));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from }) }));

function from() {
  const builder: any = {
    update: vi.fn((payload: any) => { updatePayload = payload; return builder; }),
    eq: vi.fn(() => builder),
    select: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data: found, error: null })),
  };
  return builder;
}

beforeEach(() => {
  vi.resetModules();
  isAdmin = true;
  updatePayload = undefined;
  found = { id: '11111111-1111-4111-8111-111111111111', shift: 'second' };
});

describe('POST /api/admin/preceptors/shift', () => {
  it('denies non-admin users', async () => {
    isAdmin = false;
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/preceptors/shift', {
      method: 'POST',
      body: JSON.stringify({ preceptorId: '11111111-1111-4111-8111-111111111111', shift: 'second' }),
    }) as any);
    expect(response.status).toBe(403);
  });

  it('assigns a preceptor to a shift', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/preceptors/shift', {
      method: 'POST',
      body: JSON.stringify({ preceptorId: '11111111-1111-4111-8111-111111111111', shift: 'second' }),
    }) as any);
    expect(response.status).toBe(200);
    expect(updatePayload).toEqual({ shift: 'second' });
  });

  it('rejects an invalid shift', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/preceptors/shift', {
      method: 'POST',
      body: JSON.stringify({ preceptorId: '11111111-1111-4111-8111-111111111111', shift: 'fourth' }),
    }) as any);
    expect(response.status).toBe(400);
    expect(updatePayload).toBeUndefined();
  });

  it('returns 404 for an unknown preceptor', async () => {
    found = null;
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/preceptors/shift', {
      method: 'POST',
      body: JSON.stringify({ preceptorId: '11111111-1111-4111-8111-111111111111', shift: 'first' }),
    }) as any);
    expect(response.status).toBe(404);
  });
});
