import { describe, expect, it } from 'vitest';
import { getShiftRotation, getShiftKey } from '@/lib/shift-rotation';

describe('getShiftRotation', () => {
  it('returns First Shift for the July 16, 2026 anchor date', () => {
    expect(getShiftRotation('2026-07-16')).toEqual({
      key: 'first',
      label: 'First Shift',
      chief: 'R Brown',
      color: 'orange',
    });
  });

  it.each([
    ['2026-07-17', 'second', 'Second Shift', 'S Bellot', 'yellow'],
    ['2026-07-18', 'third', 'Third Shift', 'M Martin', 'gray'],
    ['2026-07-19', 'first', 'First Shift', 'R Brown', 'orange'],
  ] as const)('returns the expected crew for %s', (date, key, label, chief, color) => {
    expect(getShiftRotation(date)).toEqual({ key, label, chief, color });
  });

  it('uses the schedule start date for a full 0700-to-0700 ride', () => {
    expect(getShiftRotation('2026-07-18').chief).toBe('M Martin');
  });
});

describe('getShiftKey', () => {
  it('maps a date to its crew shift key', () => {
    expect(getShiftKey('2026-07-16')).toBe('first');
    expect(getShiftKey('2026-07-17')).toBe('second');
    expect(getShiftKey('2026-07-18')).toBe('third');
  });
});
