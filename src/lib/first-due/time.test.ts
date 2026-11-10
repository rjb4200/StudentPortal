import { describe, expect, it } from 'vitest';
import {
  easternWallClockToUtcString,
  formatEasternDateTime,
  getEasternDateSpan,
  getEasternDateWindow,
  normalizeClockTime,
} from '@/lib/first-due/time';

describe('getEasternDateWindow', () => {
  it('uses the Eastern calendar day, not UTC', () => {
    expect(getEasternDateWindow(new Date('2026-11-11T02:00:00Z'))).toEqual({
      today: '2026-11-10',
      tomorrow: '2026-11-11',
    });
  });

  it('rolls over at Eastern midnight', () => {
    expect(getEasternDateWindow(new Date('2026-11-11T05:00:00Z'))).toEqual({
      today: '2026-11-11',
      tomorrow: '2026-11-12',
    });
  });
});

describe('getEasternDateSpan', () => {
  it('covers today plus four days for a five-day window', () => {
    expect(getEasternDateSpan(5, new Date('2026-11-10T10:00:00Z'))).toEqual({
      from: '2026-11-10',
      to: '2026-11-14',
    });
  });

  it('rejects an invalid window length', () => {
    expect(() => getEasternDateSpan(0)).toThrow();
    expect(() => getEasternDateSpan(32)).toThrow();
  });
});

describe('formatEasternDateTime', () => {
  it('formats the web surface wall clock', () => {
    expect(formatEasternDateTime('2026-11-10', '07:00')).toBe('11/10/2026 07:00:00');
    expect(formatEasternDateTime('2026-11-10', '7:00 AM')).toBe('11/10/2026 07:00:00');
  });

  it('rejects impossible dates and times', () => {
    expect(() => formatEasternDateTime('2026-02-30', '07:00')).toThrow();
    expect(() => formatEasternDateTime('2026-11-10', '24:00')).toThrow();
  });
});

describe('easternWallClockToUtcString', () => {
  it('matches the observed First Due conversion', () => {
    expect(easternWallClockToUtcString('2026-11-10', '07:00')).toBe('2026-11-10 12:00:00');
  });

  it('uses EST in winter', () => {
    expect(easternWallClockToUtcString('2026-01-15', '09:00')).toBe('2026-01-15 14:00:00');
  });

  it('uses EDT after the spring-forward transition', () => {
    expect(easternWallClockToUtcString('2026-03-08', '09:00')).toBe('2026-03-08 13:00:00');
  });

  it('uses EST after the fall-back transition', () => {
    expect(easternWallClockToUtcString('2026-11-01', '09:00')).toBe('2026-11-01 14:00:00');
  });
});

describe('normalizeClockTime', () => {
  it.each([
    ['7:00 AM', '07:00:00'],
    ['12:00 AM', '00:00:00'],
    ['12:00 PM', '12:00:00'],
    ['10:00 PM', '22:00:00'],
    ['07:30', '07:30:00'],
  ])('normalizes %s', (value, expected) => {
    expect(normalizeClockTime(value)).toBe(expected);
  });

  it('rejects malformed values', () => {
    expect(() => normalizeClockTime('25:00')).toThrow();
    expect(() => normalizeClockTime('13:00 PM')).toThrow();
    expect(() => normalizeClockTime('seven')).toThrow();
  });
});
