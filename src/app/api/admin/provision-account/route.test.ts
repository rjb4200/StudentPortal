import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let mockState: any;
let adminMocks: any;

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-id' } } })) } }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => true }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createMockAdminClient(),
}));

function createMockAdminClient() {
  adminMocks = {
    listUsers: vi.fn(async () => ({ data: { users: mockState.existingUsers }, error: null })),
    createUser: vi.fn(async () => mockState.createUserResult),
    deleteUser: vi.fn(async () => ({ error: null })),
  };
  return { auth: { admin: adminMocks }, from: (table: string) => createBuilder(table) };
}

function createBuilder(table: string) {
  const b: any = { _eq: {}, _insert: null, _update: null, _delete: false };
  b.select = vi.fn(() => b);
  b.insert = vi.fn((payload: unknown) => { b._insert = payload; return b; });
  b.update = vi.fn((payload: unknown) => { b._update = payload; return b; });
  b.delete = vi.fn(() => { b._delete = true; return b; });
  b.eq = vi.fn((field: string, value: unknown) => { b._eq[field] = value; return b; });
  b.is = vi.fn(() => b);
  b.lt = vi.fn(() => b);
  b.neq = vi.fn(() => b);
  b.in = vi.fn(() => b);
  b.maybeSingle = vi.fn(async () => {
    const row = mockState.rows?.[table] ?? {};
    if ('email' in b._eq) return { data: row.byEmail ?? null, error: null };
    if ('auth_user_id' in b._eq) return { data: row.byAuthId ?? null, error: null };
    return { data: null, error: null };
  });
  b.single = vi.fn(async () => {
    if (b._insert) return mockState.insertResults?.[table] ?? { data: { id: `${table}-new` }, error: null };
    if (b._update) return mockState.linkResult ?? { data: { id: `${table}-linked` }, error: null };
    return { data: null, error: null };
  });
  b.then = (resolve: (value: unknown) => unknown) => {
    if (b._delete) mockState.deletes.push(table);
    return Promise.resolve({ data: null, error: null }).then(resolve);
  };
  return b;
}

function adminBody(overrides: Record<string, unknown> = {}) {
  return {
    accountType: 'admin',
    email: 'new.admin@example.com',
    password: 'secret1',
    fullName: 'New Admin',
    rank: 'Training Major',
    ...overrides,
  };
}

async function post(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/admin/provision-account', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => {
  vi.resetModules();
  mockState = {
    existingUsers: [],
    rows: {},
    deletes: [],
    createUserResult: { data: { user: { id: 'created-1' } }, error: null },
    insertResults: {},
    linkResult: { data: { id: 'linked' }, error: null },
  };
});

describe('POST /api/admin/provision-account', () => {
  it('adopts an unlinked existing auth user whose role matches', async () => {
    mockState.existingUsers = [
      { id: 'u1', email: 'orphan@example.com', app_metadata: { role: 'preceptor' }, last_sign_in_at: null },
    ];

    const res = await post({
      accountType: 'preceptor',
      email: 'orphan@example.com',
      password: 'secret1',
      fullName: 'Orphan Preceptor',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.adopted).toBe(true);
    expect(data.userId).toBe('u1');
    expect(adminMocks.createUser).not.toHaveBeenCalled();
    expect(adminMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects a role mismatch without silently changing the existing role', async () => {
    mockState.existingUsers = [
      { id: 'u2', email: 'student@example.com', app_metadata: { role: 'student' }, last_sign_in_at: null },
    ];
    mockState.rows = { students: { byAuthId: { id: 's1' } } };

    const res = await post(adminBody({ email: 'student@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe('role_mismatch');
    expect(data.ownerType).toBe('student');
    expect(adminMocks.createUser).not.toHaveBeenCalled();
  });

  it('rejects an email that already backs a linked account', async () => {
    mockState.existingUsers = [
      { id: 'u3', email: 'dupe@example.com', app_metadata: { role: 'admin' }, last_sign_in_at: null },
    ];
    mockState.rows = { admin_accounts: { byEmail: { id: 'a1', auth_user_id: 'u3' } } };

    const res = await post(adminBody({ email: 'dupe@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe('email_exists');
    expect(adminMocks.createUser).not.toHaveBeenCalled();
  });

  it('deletes only the auth user it created when linking fails', async () => {
    mockState.existingUsers = [];
    mockState.linkResult = { data: null, error: { message: 'link failed' } };

    const res = await post(adminBody());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.code).toBe('link_failed');
    expect(adminMocks.createUser).toHaveBeenCalledTimes(1);
    expect(adminMocks.deleteUser).toHaveBeenCalledWith('created-1');
    expect(mockState.deletes).toContain('admin_accounts');
  });

  it('fails on the profile insert before creating any auth user', async () => {
    mockState.existingUsers = [];
    mockState.insertResults = {
      admin_accounts: {
        data: null,
        error: { message: 'duplicate key value violates unique constraint "admin_accounts_email_key"' },
      },
    };

    const res = await post(adminBody());

    expect(res.status).toBe(400);
    expect(adminMocks.createUser).not.toHaveBeenCalled();
  });
});
