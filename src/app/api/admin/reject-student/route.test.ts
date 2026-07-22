import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const sendEmail = vi.fn(async () => ({ ok: true }));
const buildStudentRejectionEmail = vi.fn(() => ({ subject: 'Declined', html: '<p>declined</p>' }));
const buildInstructorRejectionEmail = vi.fn(() => ({ subject: 'Declined', html: '<p>declined</p>' }));
const buildAdminRejectionNotification = vi.fn(() => ({ subject: 'Rejected', html: '<p>rejected</p>' }));
const deleteUser = vi.fn(async () => ({ error: null }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-id', email: 'admin@example.com' } } })) },
  }),
}));
vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => true }));
vi.mock('@/lib/email', () => ({ sendEmail }));
vi.mock('@/lib/email-templates', () => ({
  buildStudentRejectionEmail,
  buildInstructorRejectionEmail,
  buildAdminRejectionNotification,
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => createQueryBuilder(),
    auth: { admin: { deleteUser } },
  }),
}));

let _singleResult: any = {
  data: {
    email: 'student@example.com',
    full_name: 'Student One',
    phone: '555-1234',
    school_name: 'Test School',
    status: 'pending',
    onboarding_completed_at: '2026-07-16T12:00:00.000Z',
    auth_user_id: 'auth-user-uuid',
    instructor_name: 'Instructor Name',
    instructor_contact: 'instructor@example.com',
    training_classes: {
      name: 'EMT Class A',
      level: 'Basic',
      class_start_date: '2026-07-01',
      ride_time_end_date: '2026-08-31',
      training_sites: { name: 'Station 1' },
      instructors: { first_name: 'Jane', last_name: 'Instructor', email: 'jane@example.com' },
    },
  },
  error: null,
};

function createQueryBuilder() {
  const builder: any = {
    update: vi.fn(() => builder),
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => _singleResult),
    then: (resolve: (value: { error: null }) => unknown) => Promise.resolve({ error: null }).then(resolve),
  };
  return builder;
}

describe('POST /api/admin/reject-student', () => {
  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockClear();
    deleteUser.mockClear();
    buildStudentRejectionEmail.mockClear();
    buildInstructorRejectionEmail.mockClear();
    buildAdminRejectionNotification.mockClear();
    _singleResult = {
      data: {
        email: 'student@example.com',
        full_name: 'Student One',
        phone: '555-1234',
        school_name: 'Test School',
        status: 'pending',
        onboarding_completed_at: '2026-07-16T12:00:00.000Z',
        auth_user_id: 'auth-user-uuid',
        instructor_name: 'Instructor Name',
        instructor_contact: 'instructor@example.com',
        training_classes: {
          name: 'EMT Class A',
          level: 'Basic',
          class_start_date: '2026-07-01',
          ride_time_end_date: '2026-08-31',
          training_sites: { name: 'Station 1' },
          instructors: { first_name: 'Jane', last_name: 'Instructor', email: 'jane@example.com' },
        },
      },
      error: null,
    };
  });

  it('rejects a pending student and sends all three emails', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Missing eligibility documents',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith('auth-user-uuid');
    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'student@example.com' }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'jane@example.com' }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'admin@example.com' }));
  });

  it('blocks rejection when reason is empty', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: '',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBeTruthy();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('blocks rejection when reason is missing', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('blocks rejection for already certified student', async () => {
    _singleResult.data.status = 'certified';
    _singleResult.data.auth_user_id = null;

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Some reason',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('not pending');
  });

  it('blocks rejection when student has not completed onboarding', async () => {
    _singleResult.data.onboarding_completed_at = null;

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Incomplete onboarding',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toContain('onboarding');
  });

  it('returns error when auth user deletion fails', async () => {
    deleteUser.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Test reason',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toContain('delete auth user');
  });

  it('rejection succeeds even when email delivery fails', async () => {
    sendEmail.mockRejectedValueOnce(new Error('SMTP down'));

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Test reason',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('handles student without auth_user_id gracefully', async () => {
    _singleResult.data.auth_user_id = null;

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Test reason',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('handles student without training class gracefully', async () => {
    _singleResult.data.training_classes = null;

    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/admin/reject-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: '11111111-1111-4111-8111-111111111111',
          reason: 'Test reason',
        }),
      }) as any
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    // Should only send student + admin emails (no instructor email)
    const instructorEmails = sendEmail.mock.calls.filter(
      (call: any) => call[0]?.to === 'jane@example.com'
    );
    expect(instructorEmails.length).toBe(0);
  });
});
