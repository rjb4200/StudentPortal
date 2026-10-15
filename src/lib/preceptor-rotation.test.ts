import { describe, expect, it } from 'vitest';
import { poolForDate, availablePreceptorsForDate } from '@/lib/preceptor-rotation';

const preceptors = [
  { id: 'first-active', shift: 'first' as const, is_active: true },
  { id: 'first-inactive', shift: 'first' as const, is_active: false },
  { id: 'second-active', shift: 'second' as const, is_active: true },
  { id: 'third-active', shift: 'third' as const, is_active: true },
  { id: 'unassigned', shift: null, is_active: true },
];

describe('poolForDate', () => {
  it('returns active preceptors on the day shift (First Shift on July 16)', () => {
    expect(poolForDate('2026-07-16', preceptors).map((p) => p.id)).toEqual(['first-active']);
  });

  it('follows the rotation to the next shift', () => {
    expect(poolForDate('2026-07-17', preceptors).map((p) => p.id)).toEqual(['second-active']);
    expect(poolForDate('2026-07-18', preceptors).map((p) => p.id)).toEqual(['third-active']);
  });

  it('excludes inactive preceptors', () => {
    expect(poolForDate('2026-07-16', preceptors).map((p) => p.id)).not.toContain('first-inactive');
  });

  it('excludes unassigned preceptors', () => {
    expect(poolForDate('2026-07-16', preceptors).map((p) => p.id)).not.toContain('unassigned');
  });
});

describe('availablePreceptorsForDate', () => {
  it('removes preceptors already paired that day', () => {
    const available = availablePreceptorsForDate('2026-07-16', preceptors, ['first-active']);
    expect(available).toEqual([]);
  });

  it('keeps unpaired preceptors in the pool', () => {
    const pool = [
      { id: 'a', shift: 'first' as const, is_active: true },
      { id: 'b', shift: 'first' as const, is_active: true },
    ];
    expect(availablePreceptorsForDate('2026-07-16', pool, ['a']).map((p) => p.id)).toEqual(['b']);
  });
});
