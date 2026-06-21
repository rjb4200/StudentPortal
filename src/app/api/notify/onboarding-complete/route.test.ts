import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal-chi-woad.vercel.app';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let mockState: any;

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createMockAdminClient(),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(async () => ({ ok: true })),
}));

vi.mock('@/lib/email-templates', () => ({
  buildOnboardingCompleteAdminEmail: vi.fn(() => ({ subject: 'Admin', html: '<p>admin</p>' })),
  buildOnboardingCompleteStudentEmail: vi.fn(() => ({ subject: 'Student', html: '<p>student</p>' })),
}));

function createMockAdminClient() {
  return {
    auth: {
      admin: {
        listUsers: vi.fn(async () => ({ data: { users: mockState.users ?? [] } })),
        createUser: vi.fn(async () => ({ data: { user: { id: 'auth-user-id', email: mockState.student.email } }, error: null })),
      },
    },
    from: (table: string) => createQueryBuilder(table),
  };
}

function createQueryBuilder(table: string) {
  const builder: any = {
    updatePayload: null,
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    update: vi.fn((payload) => {
      builder.updatePayload = payload;
      return builder;
    }),
    maybeSingle: vi.fn(async () => {
      if (table === 'onboarding_sessions') return { data: mockState.session, error: mockState.sessionError ?? null };
      return { data: null, error: null };
    }),
    single: vi.fn(async () => {
      if (table === 'students' && builder.updatePayload) return { data: { id: mockState.student.id }, error: mockState.studentUpdateError ?? null };
      if (table === 'students') return { data: mockState.student, error: mockState.studentError ?? null };
      if (table === 'onboarding_sessions' && builder.updatePayload) return { data: { id: mockState.session?.id }, error: mockState.sessionUpdateError ?? null };
      return { data: null, error: null };
    }),
    then: (resolve: any) => {
      if (table === 'admin_accounts') return Promise.resolve({ data: mockState.admins ?? [], error: null }).then(resolve);
      return Promise.resolve({ data: null, error: null }).then(resolve);
    },
  };
  return builder;
}

async function post(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.test/api/notify/onboarding-complete', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as any);
}

beforeEach(() => {
  vi.resetModules();
  mockState = {
    session: {
      id: 'session-id',
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      completed_at: null,
    },
    student: {
      id: '11111111-1111-4111-8111-111111111111',
      auth_user_id: null,
      full_name: 'Student Person',
      email: 'student@example.com',
      school_name: 'EMS School',
      status: 'pending',
      is_blacklisted: false,
      onboarding_completed_at: null,
      legal_signature: 'Student Person',
    },
    users: [],
    admins: [{ email: 'admin@example.com' }],
  };
});

describe('POST /api/notify/onboarding-complete', () => {
  it('returns a PIN for a verified onboarding session', async () => {
    const res = await post({
      studentId: mockState.student.id,
      onboardingToken: 'abcdefghijklmnopqrstuvwxyz123456',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.password).toMatch(/^\d{6}$/);
    expect(data.email).toBe('student@example.com');
    expect(data.isNewAccount).toBe(true);
  });

  it('rejects missing onboarding token without returning credentials', async () => {
    const res = await post({ studentId: mockState.student.id });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.password).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain('abcdefghijklmnopqrstuvwxyz123456');
  });

  it('rejects mismatched onboarding token without returning credentials', async () => {
    mockState.session = null;
    const res = await post({
      studentId: mockState.student.id,
      onboardingToken: 'wrong-token-wrong-token-wrong-token',
    });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.password).toBeUndefined();
  });

  it('rejects expired onboarding sessions', async () => {
    mockState.session.expires_at = new Date(Date.now() - 60_000).toISOString();
    const res = await post({
      studentId: mockState.student.id,
      onboardingToken: 'abcdefghijklmnopqrstuvwxyz123456',
    });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.password).toBeUndefined();
  });

  it('rejects consumed onboarding sessions', async () => {
    mockState.session.completed_at = new Date().toISOString();
    const res = await post({
      studentId: mockState.student.id,
      onboardingToken: 'abcdefghijklmnopqrstuvwxyz123456',
    });
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.password).toBeUndefined();
  });
});
