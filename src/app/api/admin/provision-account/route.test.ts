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
    updateUserById: vi.fn(async () => ({ data: { user: { id: 'updated' } }, error: null })),
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
    if ('email' in b._eq) {
      if (table === 'students') return { data: mockState.studentsByEmail ?? null, error: null };
      return { data: mockState.targetRow ?? null, error: null };
    }
    if ('auth_user_id' in b._eq) {
      return { data: mockState.ownerRows?.[table] ?? null, error: null };
    }
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

function preceptorBody(overrides: Record<string, unknown> = {}) {
  return {
    accountType: 'preceptor',
    email: 'new.preceptor@example.com',
    password: 'secret1',
    fullName: 'New Preceptor',
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
    studentsByEmail: null,
    targetRow: null,
    ownerRows: {},
    existingUsers: [],
    deletes: [],
    createUserResult: { data: { user: { id: 'created-1' } }, error: null },
    insertResults: {},
    linkResult: { data: { id: 'linked' }, error: null },
  };
});

describe('POST /api/admin/provision-account', () => {
  it('replaces an unlinked staff login instead of adopting it', async () => {
    mockState.existingUsers = [
      { id: 'u1', email: 'orphan@example.com', app_metadata: { role: 'preceptor' }, last_sign_in_at: null },
    ];

    const res = await post(preceptorBody({ email: 'orphan@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.replaced).toBe(true);
    expect(adminMocks.deleteUser).toHaveBeenCalledWith('u1');
    expect(adminMocks.createUser).toHaveBeenCalledTimes(1);
    expect(adminMocks.updateUserById).not.toHaveBeenCalled();
  });

  it('requires confirmation before escalating a preceptor login to admin', async () => {
    mockState.existingUsers = [
      { id: 'u2', email: 'orphan@example.com', app_metadata: { role: 'preceptor' }, last_sign_in_at: null },
    ];

    const first = await post(adminBody({ email: 'orphan@example.com' }));
    const firstData = await first.json();
    expect(first.status).toBe(409);
    expect(firstData.code).toBe('confirmation_required');
    expect(firstData.existingRole).toBe('preceptor');
    expect(adminMocks.deleteUser).not.toHaveBeenCalled();
    expect(adminMocks.createUser).not.toHaveBeenCalled();

    const second = await post(adminBody({ email: 'orphan@example.com', confirmRoleChange: true }));
    const secondData = await second.json();
    expect(second.status).toBe(200);
    expect(secondData.replaced).toBe(true);
    expect(adminMocks.deleteUser).toHaveBeenCalledWith('u2');
    expect(adminMocks.createUser).toHaveBeenCalledTimes(1);
  });

  it('refuses a staff account for an email used by a student record', async () => {
    mockState.studentsByEmail = { id: 's1' };

    const res = await post(adminBody({ email: 'student@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe('cross_family');
    expect(adminMocks.createUser).not.toHaveBeenCalled();
  });

  it('changes a linked staff login role in place without deleting it', async () => {
    mockState.existingUsers = [
      { id: 'u3', email: 'prec@example.com', app_metadata: { role: 'preceptor' }, last_sign_in_at: '2026-01-01T00:00:00Z' },
    ];
    mockState.ownerRows = { preceptors: { id: 'p1' } };

    const res = await post(adminBody({ email: 'prec@example.com', confirmRoleChange: true }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.roleChanged).toBe(true);
    expect(adminMocks.updateUserById).toHaveBeenCalledWith('u3', expect.objectContaining({ app_metadata: { role: 'admin' } }));
    expect(adminMocks.deleteUser).not.toHaveBeenCalled();
    expect(adminMocks.createUser).not.toHaveBeenCalled();
  });

  it('fails on the profile insert before creating any auth login', async () => {
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

  it('deletes only the login it created when linking fails', async () => {
    mockState.linkResult = { data: null, error: { message: 'link failed' } };

    const res = await post(adminBody());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.code).toBe('link_failed');
    expect(adminMocks.createUser).toHaveBeenCalledTimes(1);
    expect(adminMocks.deleteUser).toHaveBeenCalledWith('created-1');
    expect(mockState.deletes).toContain('admin_accounts');
  });
});
