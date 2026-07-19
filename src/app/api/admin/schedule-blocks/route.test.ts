import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let isAdmin = true;
let upsertPayload: unknown;
let rpcPayload: unknown;

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })) } }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => isAdmin }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => createQueryBuilder(),
    rpc: (_: string, payload: unknown) => {
      rpcPayload = payload;
      return Promise.resolve({ data: [{ total_days: 2, created_blocks: 1, already_blocked: 1, pending_schedules: 1, approved_schedules: 0 }], error: null });
    },
  }),
}));

function createQueryBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    upsert: vi.fn((payload) => { upsertPayload = payload; return builder; }),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: { date: '2026-07-21', reason: null }, error: null })),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return builder;
}

beforeEach(() => {
  vi.resetModules();
  isAdmin = true;
  upsertPayload = undefined;
  rpcPayload = undefined;
});

describe('schedule block administration', () => {
  it('denies block management to non-admin users', async () => {
    isAdmin = false;
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/schedule-blocks') as any);
    expect(response.status).toBe(403);
  });

  it('stores an optional empty reason as null', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/schedule-blocks', {
      method: 'POST',
      body: JSON.stringify({ date: '2026-07-21', reason: '' }),
    }) as any);
    expect(response.status).toBe(200);
    expect(upsertPayload).toEqual(expect.objectContaining({ date: '2026-07-21', reason: null, created_by: 'admin-user-id' }));
  });

  it('creates an authorized date range through the atomic RPC', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/schedule-blocks', {
      method: 'POST',
      body: JSON.stringify({ startDate: '2026-07-21', endDate: '2026-07-22', reason: 'Training' }),
    }) as any);
    expect(response.status).toBe(200);
    expect(rpcPayload).toEqual({ p_start_date: '2026-07-21', p_end_date: '2026-07-22', p_reason: 'Training', p_admin_id: 'admin-user-id' });
  });
});
