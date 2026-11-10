import { describe, expect, it } from 'vitest';
import { buildScheduleToken, hasScheduleToken, parseScheduleToken } from '@/lib/first-due/token';

const SCHEDULE_ID = '3f8a1c2e-9b7d-4e6a-8c5f-1d2e3a4b5c6d';

describe('buildScheduleToken', () => {
  it('round-trips through parseScheduleToken', () => {
    const token = buildScheduleToken(SCHEDULE_ID);
    expect(token).toBe(`SP#${SCHEDULE_ID}`);
    expect(parseScheduleToken(`${token}\nStudent: Test`)).toBe(SCHEDULE_ID);
  });

  it('rejects a non-uuid schedule id', () => {
    expect(() => buildScheduleToken('not-a-uuid')).toThrow();
  });
});

describe('parseScheduleToken', () => {
  it('finds the token among prose lines', () => {
    const notes = 'Student: Jane Doe\nSP#3F8A1C2E-9B7D-4E6A-8C5F-1D2E3A4B5C6D\nPreceptor: R Brown';
    expect(parseScheduleToken(notes)).toBe(SCHEDULE_ID);
  });

  it('returns null for empty, missing, or malformed tokens', () => {
    expect(parseScheduleToken(null)).toBeNull();
    expect(parseScheduleToken('')).toBeNull();
    expect(parseScheduleToken('Student: Jane Doe')).toBeNull();
    expect(parseScheduleToken('SP#not-a-uuid')).toBeNull();
    expect(parseScheduleToken('SP#3f8a1c2e-9b7d-4e6a-8c5f')).toBeNull();
  });

  it('ignores a token that is not on its own line', () => {
    expect(parseScheduleToken(`Student SP#${SCHEDULE_ID}`)).toBeNull();
  });
});

describe('hasScheduleToken', () => {
  it('matches case-insensitively', () => {
    expect(hasScheduleToken(`SP#${SCHEDULE_ID.toUpperCase()}`, SCHEDULE_ID)).toBe(true);
    expect(hasScheduleToken(`SP#${SCHEDULE_ID}`, '3f8a1c2e-0000-4e6a-8c5f-1d2e3a4b5c6d')).toBe(false);
  });
});
