import 'server-only';
import { firstDueEnv } from '@/lib/env.server';
import { createFirstDueAlertSender } from '@/lib/first-due/alerts';
import { getFirstDueClient, type ActivityDetail, type FirstDueClient } from '@/lib/first-due/client';
import { createFirstDueRepository } from '@/lib/first-due/repository';
import type { FirstDueRepository } from '@/lib/first-due/sync';

export type ImmediateCancellationResult = 'cancelled' | 'skipped';

export async function cancelLinkedEventForSchedule(
  schedule: { id: string; date: string },
  deps: {
    client: Pick<FirstDueClient, 'getActivity' | 'cancelEvent'>;
    repository: Pick<FirstDueRepository, 'getLink' | 'saveLink'>;
  }
): Promise<ImmediateCancellationResult> {
  const link = await deps.repository.getLink(schedule.id);
  if (!link || link.eventId == null) return 'skipped';
  if (link.state === 'cancelled') return 'skipped';

  let detail: ActivityDetail;
  try {
    detail = await deps.client.getActivity(link.eventId, schedule.date);
  } catch {
    // The event is gone or unreadable; the daily reconciler will settle the ledger.
    return 'skipped';
  }

  const cancelled = await deps.client.cancelEvent(detail);
  await deps.repository.saveLink({
    scheduleId: schedule.id,
    token: link.token,
    eventId: cancelled.id,
    state: 'cancelled',
  });
  return 'cancelled';
}

export async function runImmediateCancellation(schedule: { id: string; date: string }): Promise<void> {
  if (!firstDueEnv.enabled || !firstDueEnv.writesEnabled || !firstDueEnv.session) return;

  const notify = createFirstDueAlertSender();

  try {
    await cancelLinkedEventForSchedule(schedule, {
      client: getFirstDueClient(),
      repository: createFirstDueRepository(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Immediate First Due cancellation failed';
    console.error('Immediate First Due cancellation failed:', message);
    try {
      await notify({
        kind: 'DRIFT',
        subject: 'Immediate First Due cancellation failed',
        lines: [`Schedule ${schedule.id}: ${message}`],
      });
    } catch {}
  }
}
