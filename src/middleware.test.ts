import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let mockState: any;

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: mockState.user } })) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockState.student, error: null }),
        }),
      }),
    }),
  }),
}));

async function run(pathname: string) {
  const { middleware } = await import('./middleware');
  return middleware(new NextRequest(`https://example.test${pathname}`));
}

function isNext(response: Response) {
  return response.headers.get('x-middleware-next') === '1';
}

beforeEach(() => {
  vi.resetModules();
  mockState = {
    user: { id: 'user-1', app_metadata: { role: 'admin' } },
    student: { status: 'certified', access_until: null, is_blacklisted: false, onboarding_completed_at: '2026-01-01T00:00:00Z' },
  };
});

describe('middleware dual-role access', () => {
  it('allows an admin who also has a student enrollment into /admin', async () => {
    const res = await run('/admin');
    expect(isNext(res)).toBe(true);
  });

  it('allows an admin who also has a student enrollment into /dashboard', async () => {
    const res = await run('/dashboard');
    expect(isNext(res)).toBe(true);
  });

  it('allows a preceptor who also has a student enrollment into /preceptor', async () => {
    mockState.user = { id: 'user-2', app_metadata: { role: 'preceptor' } };
    const res = await run('/preceptor');
    expect(isNext(res)).toBe(true);
  });

  it('denies a student-only role access to /admin', async () => {
    mockState.user = { id: 'user-3', app_metadata: { role: 'student' } };
    const res = await run('/admin');
    expect(res.status).toBe(403);
  });

  it('denies a student-only role access to /preceptor', async () => {
    mockState.user = { id: 'user-4', app_metadata: { role: 'student' } };
    const res = await run('/preceptor');
    expect(res.status).toBe(403);
  });
});
