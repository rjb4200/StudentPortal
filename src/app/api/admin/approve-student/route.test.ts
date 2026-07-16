import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const sendEmail = vi.fn(async () => ({ ok: true }));
const buildStudentApprovalEmail = vi.fn(() => ({ subject: 'Approved', html: '<p>approved</p>' }));
const getStationOneMapUrl = vi.fn(async () => 'https://maps.example/station-1');

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-id' } } })) } }),
}));
vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => true }));
vi.mock('@/lib/email', () => ({ sendEmail }));
vi.mock('@/lib/email-templates', () => ({ buildStudentApprovalEmail }));
vi.mock('@/lib/station-map', () => ({ getStationOneMapUrl }));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => createQueryBuilder() }),
}));

function createQueryBuilder() {
  const builder: any = {
    update: vi.fn(() => builder),
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => ({
      data: {
        email: 'student@example.com',
        full_name: 'Student One',
        status: 'pending',
        onboarding_completed_at: '2026-07-16T12:00:00.000Z',
        training_classes: { ride_time_end_date: '2026-08-31' },
      },
      error: null,
    })),
    then: (resolve: (value: { error: null }) => unknown) => Promise.resolve({ error: null }).then(resolve),
  };
  return builder;
}

describe('POST /api/admin/approve-student', () => {
  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockClear();
    buildStudentApprovalEmail.mockClear();
    getStationOneMapUrl.mockClear();
  });

  it('adds Station 1 map guidance without making approval email delivery mandatory', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/admin/approve-student', {
      method: 'POST',
      body: JSON.stringify({ studentId: '11111111-1111-4111-8111-111111111111' }),
    }) as any);

    expect(response.status).toBe(200);
    expect(getStationOneMapUrl).toHaveBeenCalledWith(expect.anything(), 'https://student-portal.example');
    expect(buildStudentApprovalEmail).toHaveBeenCalledWith(expect.objectContaining({
      station_map_url: 'https://maps.example/station-1',
    }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'student@example.com' }));
  });
});
