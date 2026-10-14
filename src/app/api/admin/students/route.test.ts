import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let isAdmin = true;
let eqCalls: [string, unknown][] = [];
let orCalls: string[] = [];
const rows = [
  { id: 'student-one', full_name: 'Jane Doe', email: 'jane@example.com', status: 'certified' },
  { id: 'student-two', full_name: 'John Roe', email: 'john@example.com', status: 'pending' },
];

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })) },
  }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => isAdmin }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from }),
}));

function from() {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn((column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return builder;
    }),
    or: vi.fn((expression: string) => {
      orCalls.push(expression);
      return builder;
    }),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(resolve),
  };
  return builder;
}

beforeEach(() => {
  vi.resetModules();
  isAdmin = true;
  eqCalls = [];
  orCalls = [];
});

describe('GET /api/admin/students', () => {
  it('denies non-admin users', async () => {
    isAdmin = false;
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/students') as any);
    expect(response.status).toBe(403);
    expect(eqCalls).toEqual([]);
  });

  it('returns non-blacklisted students', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/students') as any);
    expect(response.status).toBe(200);
    expect(eqCalls).toContainEqual(['is_blacklisted', false]);
    expect(orCalls).toEqual([]);
    const body = await response.json();
    expect(body.students).toHaveLength(2);
  });

  it('filters by name or email when a query is provided', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test/api/admin/students?query=jane') as any);
    expect(response.status).toBe(200);
    expect(orCalls[0]).toContain('ilike.%jane%');
    expect(orCalls[0]).toContain('full_name');
    expect(orCalls[0]).toContain('email');
  });
});
