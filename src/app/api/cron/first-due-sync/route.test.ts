import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.CRON_SECRET = 'test-secret';

const h = vi.hoisted(() => ({
  run: vi.fn(async () => ({ skipped: 'disabled' as const })),
}));

vi.mock('@/lib/first-due/run', () => ({ runFirstDueSyncJob: h.run }));

async function callRoute(headers: Record<string, string> = {}) {
  const { GET } = await import('./route');
  return GET(
    new Request('https://example.test/api/cron/first-due-sync', { headers }) as never
  );
}

beforeEach(() => {
  h.run.mockClear();
});

describe('GET /api/cron/first-due-sync', () => {
  it('rejects a request without the cron secret', async () => {
    const response = await callRoute();
    expect(response.status).toBe(401);
    expect(h.run).not.toHaveBeenCalled();
  });

  it('runs the synced job and returns its result', async () => {
    const response = await callRoute({ authorization: 'Bearer test-secret' });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ skipped: 'disabled' });
    expect(h.run).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when the job fails', async () => {
    h.run.mockResolvedValueOnce({
      status: 'failure',
      window: { from: '2026-11-10', to: '2026-11-14' },
      dryRun: false,
      plannedCreates: 0,
      created: 0,
      cancelled: 0,
      verified: 0,
      drifted: 0,
      authFailure: true,
      error: 'unauthorized',
    } as never);

    const response = await callRoute({ authorization: 'Bearer test-secret' });
    expect(response.status).toBe(500);
  });
});
