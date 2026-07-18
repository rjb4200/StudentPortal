import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let isAdmin = true;
let activeAdminId = 'admin-account-one';
let latestStudentMessageAt: string | null = '2026-07-18T16:00:00.000Z';
let upsertPayload: unknown;
const rpc = vi.fn(async () => ({ data: [{ student_id: 'student-one', is_unread: true }], error: null }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })) } }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => isAdmin }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from, rpc }),
}));

function from(table: string) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(async () => table === 'admin_accounts'
      ? { data: activeAdminId ? { id: activeAdminId } : null, error: null }
      : { data: null, error: null }),
    maybeSingle: vi.fn(async () => ({
      data: latestStudentMessageAt ? { created_at: latestStudentMessageAt } : null,
      error: null,
    })),
    upsert: vi.fn((payload) => {
      upsertPayload = payload;
      return builder;
    }),
    then: (resolve: (value: { error: null }) => unknown) => Promise.resolve({ error: null }).then(resolve),
  };
  return builder;
}

beforeEach(() => {
  vi.resetModules();
  isAdmin = true;
  activeAdminId = 'admin-account-one';
  latestStudentMessageAt = '2026-07-18T16:00:00.000Z';
  upsertPayload = undefined;
  rpc.mockClear();
});

describe('admin message inbox', () => {
  it('denies non-admin users', async () => {
    isAdmin = false;
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/message-inbox') as any);
    expect(response.status).toBe(403);
  });

  it('loads thread summaries only for the active admin account', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/message-inbox') as any);
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('get_admin_message_inbox', { p_admin_account_id: 'admin-account-one' });
  });

  it('acknowledges the latest server-side student message for the active admin', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/message-inbox', {
      method: 'POST',
      body: JSON.stringify({ studentId: '11111111-1111-4111-8111-111111111111' }),
    }) as any);
    expect(response.status).toBe(200);
    expect(upsertPayload).toEqual(expect.objectContaining({
      admin_account_id: 'admin-account-one',
      last_read_student_message_at: '2026-07-18T16:00:00.000Z',
      student_id: '11111111-1111-4111-8111-111111111111',
    }));
  });

  it('does not create state when no student message exists', async () => {
    latestStudentMessageAt = null;
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/message-inbox', {
      method: 'POST',
      body: JSON.stringify({ studentId: '11111111-1111-4111-8111-111111111111' }),
    }) as any);
    expect(response.status).toBe(200);
    expect(upsertPayload).toBeUndefined();
  });

  it('keeps acknowledgement state scoped to the resolved admin account', async () => {
    activeAdminId = 'admin-account-two';
    const { POST } = await import('./route');
    await POST(new Request('https://example.test/api/admin/message-inbox', {
      method: 'POST',
      body: JSON.stringify({ studentId: '11111111-1111-4111-8111-111111111111' }),
    }) as any);
    expect(upsertPayload).toEqual(expect.objectContaining({ admin_account_id: 'admin-account-two' }));
  });
});
