import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://student-portal-chi-woad.vercel.app';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const processDueSmsNotifications = vi.fn(async () => ({ processed: 1, sent: 1, failed: 0, cancelled: 0 }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: vi.fn() })),
}));

vi.mock('@/lib/notifications/sms-queue', () => ({
  processDueSmsNotifications,
}));

async function get(headers?: HeadersInit) {
  const { GET } = await import('./route');
  return GET(new Request('https://example.test/api/cron/send-sms', { headers }) as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = 'cron-secret';
});

describe('GET /api/cron/send-sms', () => {
  it('rejects unauthorized requests', async () => {
    const res = await get();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(processDueSmsNotifications).not.toHaveBeenCalled();
  });

  it('processes due SMS notifications for authorized cron requests', async () => {
    const res = await get({ authorization: 'Bearer cron-secret' });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toMatchObject({ processed: 1, sent: 1, failed: 0, cancelled: 0 });
    expect(processDueSmsNotifications).toHaveBeenCalledOnce();
  });
});
