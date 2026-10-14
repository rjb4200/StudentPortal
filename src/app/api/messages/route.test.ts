import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const student = {
  id: '11111111-1111-4111-8111-111111111111',
  full_name: 'Student One',
  email: 'student@example.com',
  status: 'certified',
  is_blacklisted: false,
};

let captured: any;
const sendEmail = vi.fn(async () => ({ ok: true }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'student-user-id' } } })) },
  }),
}));

vi.mock('@/lib/email', () => ({ sendEmail }));

vi.mock('@/lib/email-templates', () => ({
  buildStudentMessageAdminEmail: vi.fn((params: any) => {
    captured = params;
    return { subject: 'New student message', html: '<p>message</p>' };
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from }),
}));

function from(table: string) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    single: vi.fn(async () => {
      if (table === 'students') return { data: student, error: null };
      if (table === 'messages') {
        return {
          data: {
            id: 'message-1',
            student_id: student.id,
            sender: 'student',
            message_text: 'Hello',
            created_at: '2026-07-18T10:00:00.000Z',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    }),
    then: (resolve: (value: unknown) => unknown) => {
      if (table === 'admin_accounts') {
        return Promise.resolve({ data: [{ email: 'admin@example.com' }], error: null }).then(resolve);
      }
      return Promise.resolve({ data: null, error: null }).then(resolve);
    },
  };
  return builder;
}

beforeEach(() => {
  vi.resetModules();
  captured = undefined;
  sendEmail.mockClear();
});

describe('POST /api/messages', () => {
  it('links the admin notification to the Messages tab conversation', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    }) as any);

    expect(response.status).toBe(200);
    expect(captured?.conversation_url).toBe(
      `https://student-portal.example/admin?tab=messages&student=${student.id}`
    );
    expect(sendEmail).toHaveBeenCalled();
  });
});
