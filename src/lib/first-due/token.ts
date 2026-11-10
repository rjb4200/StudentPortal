const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_LINE = /^SP#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const SCHEDULE_TOKEN_PREFIX = 'SP#';

export function buildScheduleToken(scheduleId: string): string {
  if (!UUID_PATTERN.test(scheduleId)) {
    throw new Error(`Invalid schedule id: ${scheduleId}`);
  }
  return `${SCHEDULE_TOKEN_PREFIX}${scheduleId.toLowerCase()}`;
}

export function parseScheduleToken(notes: string | null | undefined): string | null {
  if (!notes) return null;

  for (const line of notes.split(/\r?\n/)) {
    const match = TOKEN_LINE.exec(line.trim());
    if (match) return match[1].toLowerCase();
  }
  return null;
}

export function hasScheduleToken(notes: string | null | undefined, scheduleId: string): boolean {
  return parseScheduleToken(notes) === scheduleId.toLowerCase();
}
