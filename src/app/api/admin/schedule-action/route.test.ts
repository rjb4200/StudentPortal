import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

let isAdmin = true;
let updatePayload: any;
const PRECEPTOR_ID = '33333333-3333-4333-8333-333333333333';
let preceptor: any = { id: PRECEPTOR_ID, full_name: 'Jane Doe', shift: 'first', is_active: true };
let alreadyPaired: any = null;
let approvedCount = 1;
let poolCount = 2;

const schedule = {
  id: '11111111-1111-4111-8111-111111111111',
  student_id: '22222222-2222-4222-8222-222222222222',
  date: '2026-07-16',
  shift_type: 'full',
  start_time: null,
  end_time: null,
  status: 'pending',
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })) } }),
}));

vi.mock('@/lib/roles', () => ({ canAccessAdmin: () => isAdmin }));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from, rpc: vi.fn(async () => ({ error: null })) }) }));

vi.mock('@/lib/email', () => ({ sendEmail: vi.fn(async () => ({ ok: true })) }));

vi.mock('@/lib/calendar-feed-server', () => ({ resolveCalendarFeedUrl: vi.fn(async () => null) }));

function from(table: string) {
  const builder: any = { _count: false, _op: null };
  builder.select = vi.fn((_cols?: any, opts?: any) => { if (opts?.count) builder._count = true; return builder; });
  builder.eq = vi.fn(() => builder);
  builder.neq = vi.fn(() => builder);
  builder.update = vi.fn((payload: any) => { updatePayload = payload; builder._op = 'update'; return builder; });
  builder.single = vi.fn(async () => {
    if (table === 'schedules') return { data: schedule, error: null };
    if (table === 'preceptors') return { data: preceptor, error: null };
    if (table === 'students') return { data: { email: 'student@example.com', full_name: 'Student One' }, error: null };
    return { data: null, error: null };
  });
  builder.maybeSingle = vi.fn(async () => {
    if (table === 'schedules') return { data: alreadyPaired, error: null };
    return { data: null, error: null };
  });
  builder.then = (resolve: (value: unknown) => unknown) => {
    if (builder._count) {
      if (table === 'schedules') return Promise.resolve({ count: approvedCount, error: null }).then(resolve);
      if (table === 'preceptors') return Promise.resolve({ count: poolCount, error: null }).then(resolve);
    }
    if (builder._op === 'update') return Promise.resolve({ error: null }).then(resolve);
    return Promise.resolve({ data: [], error: null }).then(resolve);
  };
  return builder;
}

function post(body: unknown) {
  return import('./route').then(({ POST }) => POST(new Request('https://example.test/api/admin/schedule-action', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as any));
}

beforeEach(() => {
  vi.resetModules();
  isAdmin = true;
  updatePayload = undefined;
  preceptor = { id: PRECEPTOR_ID, full_name: 'Jane Doe', shift: 'first', is_active: true };
  alreadyPaired = null;
  approvedCount = 1;
  poolCount = 2;
});

describe('POST /api/admin/schedule-action preceptor pairing', () => {
  it('denies non-admin users', async () => {
    isAdmin = false;
    const response = await post({ scheduleId: schedule.id, action: 'approved' });
    expect(response.status).toBe(403);
  });

  it('assigns an available preceptor on approval', async () => {
    const response = await post({ scheduleId: schedule.id, action: 'approved', preceptorId: PRECEPTOR_ID });
    expect(response.status).toBe(200);
    expect(updatePayload).toMatchObject({ status: 'approved', preceptor_id: PRECEPTOR_ID });
  });

  it('rejects a preceptor who is not on that day shift', async () => {
    preceptor = { id: PRECEPTOR_ID, full_name: 'Off Shift', shift: 'second', is_active: true };
    const response = await post({ scheduleId: schedule.id, action: 'approved', preceptorId: PRECEPTOR_ID });
    expect(response.status).toBe(400);
  });

  it('rejects a preceptor already paired that day', async () => {
    alreadyPaired = { id: 'other-schedule' };
    const response = await post({ scheduleId: schedule.id, action: 'approved', preceptorId: PRECEPTOR_ID });
    expect(response.status).toBe(400);
  });

  it('warns when students exceed preceptors on the day', async () => {
    approvedCount = 3;
    poolCount = 1;
    const response = await post({ scheduleId: schedule.id, action: 'approved' });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.warning).toBeTruthy();
  });

  it('does not warn within capacity', async () => {
    approvedCount = 1;
    poolCount = 2;
    const response = await post({ scheduleId: schedule.id, action: 'approved' });
    const data = await response.json();
    expect(data.warning).toBeNull();
  });
});
