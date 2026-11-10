import 'server-only';
import { firstDueEnv } from '@/lib/env.server';
import { createFirstDueAlertSender } from '@/lib/first-due/alerts';
import { getFirstDueClient } from '@/lib/first-due/client';
import { createFirstDueRepository } from '@/lib/first-due/repository';
import { runFirstDueSync, type SyncResult } from '@/lib/first-due/sync';

export type FirstDueJobResult = SyncResult | { skipped: 'disabled' };

export async function runFirstDueSyncJob(now: Date = new Date()): Promise<FirstDueJobResult> {
  const startedAt = now;
  const repository = createFirstDueRepository();

  if (!firstDueEnv.enabled) {
    await repository.recordJobRun({
      status: 'success',
      startedAt,
      finishedAt: new Date(),
      summary: { skipped: 'disabled' },
    });
    return { skipped: 'disabled' };
  }

  const result = await runFirstDueSync({
    client: getFirstDueClient(),
    repository,
    notify: createFirstDueAlertSender(),
    eventTypeId: firstDueEnv.eventTypeId,
    dryRun: !firstDueEnv.writesEnabled,
    windowDays: firstDueEnv.windowDays,
    now: startedAt,
  });

  await repository.recordJobRun({
    status: result.status,
    startedAt,
    finishedAt: new Date(),
    summary: { ...result },
    errorMessage: result.error,
  });

  return result;
}
