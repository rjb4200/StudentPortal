import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.CRON_SECRET = 'test-secret';

let mockState: any;
let deleteUserMock: any;

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createMockAdminClient(),
}));

function createMockAdminClient() {
  deleteUserMock = vi.fn(async () => ({ error: null }));
  return {
    auth: { admin: { listUsers: vi.fn(async () => ({ data: { users: mockState.users }, error: null })), deleteUser: deleteUserMock } },
    from: (table: string) => createBuilder(table),
  };
}

function createBuilder(table: string) {
  const b: any = { _select: '', _insert: null, _update: null };
  b.select = vi.fn((arg: string) => { b._select = arg; return b; });
  b.insert = vi.fn(() => b);
  b.update = vi.fn(() => b);
  b.lt = vi.fn(() => b);
  b.neq = vi.fn(() => b);
  b.in = vi.fn(() => b);
  b.eq = vi.fn(() => b);
  b.then = (resolve: (value: unknown) => unknown) => {
    if (b._select === 'auth_user_id, email') {
      return Promise.resolve({ data: mockState.profileRows[table] ?? [], error: null }).then(resolve);
    }
    if (table === 'students' && b._select === 'id') {
      return Promise.resolve({ data: mockState.expiredStudents, error: null }).then(resolve);
    }
    return Promise.resolve({ data: null, error: null }).then(resolve);
  };
  return b;
}

async function runSweep() {
  const { GET } = await import('./route');
  return GET(new Request('https://example.test/api/cron/sweep', {
    headers: { authorization: 'Bearer test-secret' },
  }) as any);
}

beforeEach(() => {
  vi.resetModules();
  delete process.env.CRON_SWEEP_CLEAN_ORPHANS;
  mockState = {
    expiredStudents: [],
    users: [
      { id: 'orphan-never', email: 'orphan@example.com', last_sign_in_at: null, app_metadata: { role: 'preceptor' } },
      { id: 'orphan-signed', email: 'signed@example.com', last_sign_in_at: '2026-01-01T00:00:00Z', app_metadata: { role: 'preceptor' } },
      { id: 'linked-user', email: 'linked@example.com', last_sign_in_at: null, app_metadata: { role: 'student' } },
    ],
    profileRows: {
      students: [{ auth_user_id: 'linked-user', email: 'linked@example.com' }],
      admin_accounts: [],
      preceptors: [],
    },
  };
});

describe('GET /api/cron/sweep orphan reconciliation', () => {
  it('detects orphans in detect-only mode without deleting them', async () => {
    const res = await runSweep();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orphans).toBe(2);
    expect(data.orphansNeverSignedIn).toBe(1);
    expect(data.orphansCleaned).toBe(0);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it('cleans only never-signed-in orphans and never linked users', async () => {
    process.env.CRON_SWEEP_CLEAN_ORPHANS = 'true';

    const res = await runSweep();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orphansCleaned).toBe(1);
    expect(deleteUserMock).toHaveBeenCalledTimes(1);
    expect(deleteUserMock).toHaveBeenCalledWith('orphan-never');
    expect(deleteUserMock).not.toHaveBeenCalledWith('orphan-signed');
    expect(deleteUserMock).not.toHaveBeenCalledWith('linked-user');
  });

  it('keeps the existing expired-student sweep behavior', async () => {
    mockState.expiredStudents = [{ id: 'expired-1' }];

    const res = await runSweep();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.expired).toBe(1);
  });
});
