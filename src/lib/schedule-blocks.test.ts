import { describe, expect, it } from 'vitest';
import { getScheduleBlock } from '@/lib/schedule-blocks';

describe('getScheduleBlock', () => {
  const blocks = [{ date: '2026-07-21', reason: 'Station training day.' }];

  it('identifies an unavailable unbooked date', () => {
    expect(getScheduleBlock(blocks, '2026-07-21')).toEqual(blocks[0]);
  });

  it('returns no block for an available date', () => {
    expect(getScheduleBlock(blocks, '2026-07-22')).toBeUndefined();
  });
});
