import { describe, expect, it } from 'vitest';
import { getCalendarFeedUrl } from '@/lib/calendar-feed';

describe('getCalendarFeedUrl', () => {
  it('builds a canonical absolute calendar subscription URL', () => {
    expect(getCalendarFeedUrl('https://studentportal.winchesterfireems.com/', '971ad3f5-6baf-43ea-80e9-9cb5f125f19c'))
      .toBe('https://studentportal.winchesterfireems.com/api/calendar/971ad3f5-6baf-43ea-80e9-9cb5f125f19c.ics');
  });
});
