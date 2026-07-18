import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://studentportal.winchesterfireems.com/';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let mockState: any;

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })),
    },
  }),
}));

vi.mock('@/lib/roles', () => ({
  canAccessAdmin: vi.fn(() => true),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => createQueryBuilder(table),
  }),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(async () => ({ ok: true })),
}));

function createQueryBuilder(table: string) {
  const builder: any = {
    updatePayload: null,
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn((payload) => {
      builder.updatePayload = payload;
      return builder;
    }),
    single: vi.fn(async () => {
      if (table === 'training_classes') return { data: mockState.trainingClass, error: mockState.trainingClassError ?? null };
      return { data: null, error: null };
    }),
    then: (resolve: any) => {
      if (builder.updatePayload) {
        mockState.updates.push({ table, payload: builder.updatePayload });
        return Promise.resolve({ error: mockState.updateError ?? null }).then(resolve);
      }
      return Promise.resolve({ data: null, error: null }).then(resolve);
    },
  };
  return builder;
}

async function post(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/admin/registry-status', {
    method: 'POST',
    headers: { cookie: 'sb=token' },
    body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockState = {
    updates: [],
    trainingClass: {
      id: '11111111-1111-4111-8111-111111111111',
      status: 'pending',
      name: 'Summer EMT',
      class_start_date: '2026-07-01',
      ride_time_end_date: '2026-08-01',
      instructors: { first_name: 'Jane', last_name: 'Instructor', email: 'jane@example.com' },
      training_sites: { name: 'Training Site A' },
    },
  };
});

describe('POST /api/admin/registry-status', () => {
  it('emails the associated instructor when a class is approved', async () => {
    const { sendEmail } = await import('@/lib/email');

    const res = await post({
      table: 'training_classes',
      id: '11111111-1111-4111-8111-111111111111',
      status: 'active',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'jane@example.com',
      subject: 'Class Approved — WFD EMS Student Portal',
      html: expect.stringContaining('https://studentportal.winchesterfireems.com/onboarding?class=11111111-1111-4111-8111-111111111111'),
    }));
  });

  it('does not send a duplicate email when the class is already active', async () => {
    const { sendEmail } = await import('@/lib/email');
    mockState.trainingClass.status = 'active';

    const res = await post({
      table: 'training_classes',
      id: '11111111-1111-4111-8111-111111111111',
      status: 'active',
    });

    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('emails the associated instructor when a suspended class is reactivated', async () => {
    const { sendEmail } = await import('@/lib/email');
    mockState.trainingClass.status = 'suspended';

    const res = await post({
      table: 'training_classes',
      id: '11111111-1111-4111-8111-111111111111',
      status: 'active',
    });

    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(mockState.updates).toEqual([
      expect.objectContaining({ table: 'training_classes', payload: expect.objectContaining({ status: 'active' }) }),
    ]);
  });

  it('keeps approval successful when the instructor email fails', async () => {
    const { sendEmail } = await import('@/lib/email');
    vi.mocked(sendEmail).mockResolvedValueOnce({ ok: false, error: 'provider unavailable' });

    const res = await post({
      table: 'training_classes',
      id: '11111111-1111-4111-8111-111111111111',
      status: 'active',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
