import { describe, expect, it } from 'vitest';
import { getReminderDeliveryOutcome, isDuplicateReminderError, isEligibleReminderSchedule, tomorrowInEastern } from '@/lib/schedule-reminders';

describe('tomorrowInEastern', () => {
  it('uses the next Eastern calendar date across UTC midnight', () => {
    expect(tomorrowInEastern(new Date('2026-07-17T01:00:00.000Z'))).toBe('2026-07-17');
  });

  it('uses the next date after the Eastern day begins', () => {
    expect(tomorrowInEastern(new Date('2026-07-17T18:00:00.000Z'))).toBe('2026-07-18');
  });
});

describe('isDuplicateReminderError', () => {
  it('identifies the unique constraint violation used by delivery claims', () => {
    expect(isDuplicateReminderError({ code: '23505' })).toBe(true);
    expect(isDuplicateReminderError({ code: 'PGRST116' })).toBe(false);
  });
});

describe('isEligibleReminderSchedule', () => {
  it('selects only approved rides on the reminder date', () => {
    expect(isEligibleReminderSchedule({ status: 'approved', date: '2026-07-18' }, '2026-07-18')).toBe(true);
    expect(isEligibleReminderSchedule({ status: 'pending', date: '2026-07-18' }, '2026-07-18')).toBe(false);
    expect(isEligibleReminderSchedule({ status: 'approved', date: '2026-07-19' }, '2026-07-18')).toBe(false);
  });
});

describe('getReminderDeliveryOutcome', () => {
  it('preserves a failed provider result for the delivery ledger', () => {
    expect(getReminderDeliveryOutcome({ ok: false, error: 'provider unavailable' })).toEqual({
      delivered: false,
      errorMessage: 'provider unavailable',
    });
  });
});
