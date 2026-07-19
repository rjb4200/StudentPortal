import { describe, expect, it } from 'vitest';
import { getScheduleBlock, getScheduleBlockRangeSummary } from '@/lib/schedule-blocks';

describe('getScheduleBlock', () => {
  const blocks = [{ date: '2026-07-21', reason: 'Station training day.' }];

  it('identifies an unavailable unbooked date', () => {
    expect(getScheduleBlock(blocks, '2026-07-21')).toEqual(blocks[0]);
  });

  it('returns no block for an available date', () => {
    expect(getScheduleBlock(blocks, '2026-07-22')).toBeUndefined();
  });
});

describe('getScheduleBlockRangeSummary', () => {
  it('summarizes inclusive dates, existing blocks, and active schedules', () => {
    expect(getScheduleBlockRangeSummary(
      '2026-07-21',
      '2026-07-23',
      [{ date: '2026-07-22', reason: null }],
      [
        { date: '2026-07-21', status: 'pending' },
        { date: '2026-07-22', status: 'approved' },
        { date: '2026-07-24', status: 'approved' },
      ],
    )).toEqual({ totalDays: 3, alreadyBlocked: 1, pendingSchedules: 1, approvedSchedules: 1 });
  });

  it('rejects a reversed date range', () => {
    expect(getScheduleBlockRangeSummary('2026-07-23', '2026-07-21', [], [])).toBeNull();
  });
});
