export const FIRST_DUE_TIME_ZONE = 'America/New_York';

const easternClock = new Intl.DateTimeFormat('en-US', {
  timeZone: FIRST_DUE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

type EasternParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0');
}

function parseIsoDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${date}`);
  }
  return { year, month, day };
}

function parseClock(time: string) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if (!match) throw new Error(`Invalid time: ${time}`);

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;
  if (hour > 23 || minute > 59 || second > 59) throw new Error(`Invalid time: ${time}`);
  return { hour, minute, second };
}

function easternParts(date: Date): EasternParts {
  const parts = easternClock.formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
}

function easternOffsetMs(date: Date): number {
  const parts = easternParts(date);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function formatUtc(date: Date) {
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  );
}

export function getEasternDateWindow(now: Date = new Date()): { today: string; tomorrow: string } {
  const parts = easternParts(now);
  const today = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  const tomorrow = `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
  return { today, tomorrow };
}

export function getEasternDateSpan(days: number, now: Date = new Date()): { from: string; to: string } {
  if (!Number.isInteger(days) || days < 1 || days > 31) {
    throw new Error(`Invalid window length: ${days}`);
  }
  const { today } = getEasternDateWindow(now);
  const parts = parseIsoDate(today);
  const end = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days - 1));
  return {
    from: today,
    to: `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`,
  };
}

export function formatEasternDateTime(date: string, time: string): string {
  const day = parseIsoDate(date);
  const clock = parseClock(normalizeClockTime(time));
  return (
    `${pad(day.month)}/${pad(day.day)}/${day.year} ` +
    `${pad(clock.hour)}:${pad(clock.minute)}:${pad(clock.second)}`
  );
}

export function easternWallClockToUtcString(date: string, time: string): string {
  const day = parseIsoDate(date);
  const clock = parseClock(normalizeClockTime(time));
  const wallAsUtc = Date.UTC(day.year, day.month - 1, day.day, clock.hour, clock.minute, clock.second);

  const firstOffset = easternOffsetMs(new Date(wallAsUtc));
  let utc = wallAsUtc - firstOffset;
  const appliedOffset = easternOffsetMs(new Date(utc));
  if (appliedOffset !== firstOffset) utc = wallAsUtc - appliedOffset;

  return formatUtc(new Date(utc));
}

export function normalizeClockTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid time: ${value}`);

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;
  const meridiem = match[4]?.toLowerCase();

  if (minute > 59 || second > 59) throw new Error(`Invalid time: ${value}`);

  if (meridiem) {
    if (hour < 1 || hour > 12) throw new Error(`Invalid time: ${value}`);
    if (meridiem === 'am') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
  } else if (hour > 23) {
    throw new Error(`Invalid time: ${value}`);
  }

  return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
}
