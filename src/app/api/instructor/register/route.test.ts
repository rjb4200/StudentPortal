import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://example.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const siteId = '11111111-1111-4111-8111-111111111111';
const instructorId = '22222222-2222-4222-8222-222222222222';
const classId = '33333333-3333-4333-8333-333333333333';
let inserts: { table: string; payload: any }[];

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: (table: string) => builder(table) }),
}));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn(async () => ({ ok: true })) }));

function builder(table: string) {
  const query: any = {
    select: () => query,
    eq: () => query,
    insert: (payload: any) => {
      inserts.push({ table, payload });
      return query;
    },
    single: async () => ({
      data: table === 'training_sites' ? { id: siteId, organization_name: 'School A' }
        : table === 'instructors' ? { id: instructorId, training_site_id: siteId }
          : table === 'training_classes' ? { id: classId } : null,
      error: null,
    }),
    then: (resolve: (value: any) => void) => Promise.resolve({
      data: table === 'admin_accounts' ? [{ email: 'admin@example.com' }] : null,
      error: null,
    }).then(resolve),
  };
  return query;
}

const base = {
  site: { mode: 'existing', trainingSiteId: siteId },
  instructor: { mode: 'existing', instructorId },
  class: { name: 'Class A', classStartDate: '2026-10-01', rideTimeEndDate: '2026-11-01' },
};

async function post(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/instructor/register', {
    method: 'POST', body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => {
  inserts = [];
  vi.clearAllMocks();
});

describe('POST /api/instructor/register MOU choice', () => {
  it('records a signed MOU and notifies admins', async () => {
    const { sendEmail } = await import('@/lib/email');
    const response = await post({ ...base, mou: {
      mode: 'signed', effectiveDate: '2026-10-01', trainingOrganizationName: 'School A',
      representativeName: 'Jane Instructor', representativeTitle: 'Coordinator',
      representativeSignature: 'Jane Instructor', mouBodySnapshot: 'Agreement terms',
    } });

    expect(response.status).toBe(200);
    expect(inserts).toContainEqual({ table: 'class_mous', payload: expect.objectContaining({ training_class_id: classId, representative_signature: 'Jane Instructor' }) });
    expect(inserts.some((item) => item.table === 'class_mou_skips')).toBe(false);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('records a skipped MOU without signing or sending a signature email', async () => {
    const { sendEmail } = await import('@/lib/email');
    const response = await post({ ...base, mou: {
      mode: 'skipped', reason: 'existing_mou', acknowledgedName: 'Jane Instructor',
    } });

    expect(response.status).toBe(200);
    expect(inserts).toContainEqual({ table: 'class_mou_skips', payload: {
      training_class_id: classId, organization_name: 'School A',
      reason: 'existing_mou', acknowledged_name: 'Jane Instructor',
    } });
    expect(inserts.some((item) => item.table === 'class_mous')).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
