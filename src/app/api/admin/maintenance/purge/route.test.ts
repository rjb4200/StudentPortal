import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://studentportal.winchesterfireems.com/';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let mockCanAccessAdmin = true;
let mockCounts: Record<string, number>;
let mockDeletes: string[];

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id', email: 'admin@example.com' } } })),
    },
  }),
}));

vi.mock('@/lib/roles', () => ({
  canAccessAdmin: vi.fn(() => mockCanAccessAdmin),
}));

vi.mock('@/lib/audit', () => ({
  auditLog: vi.fn(async () => undefined),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: vi.fn(async () => ({ count: mockCounts[table] ?? 0, error: null })),
      delete: vi.fn(() => ({
        neq: vi.fn(async () => {
          mockDeletes.push(table);
          return { error: null };
        }),
      })),
    }),
  }),
}));

async function getDryRun() {
  const { GET } = await import('./route');
  return GET(new Request('https://example.test/api/admin/maintenance/purge', {
    headers: { cookie: 'sb=token' },
  }) as any);
}

async function postPurge(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/admin/maintenance/purge', {
    method: 'POST',
    headers: { cookie: 'sb=token', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCanAccessAdmin = true;
  mockDeletes = [];
  mockCounts = {
    messages: 5,
    admin_notes: 4,
    evaluations: 3,
    schedules: 2,
    students: 1,
  };
});

describe('/api/admin/maintenance/purge', () => {
  it('blocks unauthorized dry-run access', async () => {
    mockCanAccessAdmin = false;

    const res = await getDryRun();
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('returns dry-run counts and preserved categories', async () => {
    const res = await getDryRun();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.totalRecords).toBe(15);
    expect(data.counts.students).toBe(1);
    expect(data.preservedCategories).toContain('audit_log');
  });

  it('blocks purge without reason and typed confirmation', async () => {
    const res = await postPurge({
      exportConfirmed: true,
      dryRunReviewed: true,
      confirmation: 'PURGE',
      reason: '',
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
    expect(mockDeletes).toEqual([]);
  });

  it('blocks purge before export prerequisite and dry-run review', async () => {
    const res = await postPurge({
      exportConfirmed: false,
      dryRunReviewed: false,
      confirmation: 'PURGE STUDENT DATA',
      reason: 'End of cohort cleanup after export.',
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
    expect(mockDeletes).toEqual([]);
  });

  it('deletes student data and writes audit on confirmed purge', async () => {
    const { auditLog } = await import('@/lib/audit');

    const res = await postPurge({
      exportConfirmed: true,
      dryRunReviewed: true,
      confirmation: 'PURGE STUDENT DATA',
      reason: 'End of cohort cleanup after export.',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeletes).toEqual(['messages', 'admin_notes', 'evaluations', 'schedules', 'students']);
    expect(auditLog).toHaveBeenCalledWith(expect.stringContaining('Maintenance purge completed'), 'admin@example.com');
  });
});
