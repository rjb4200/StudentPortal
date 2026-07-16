export type ShiftRotation = {
  label: 'First Shift' | 'Second Shift' | 'Third Shift';
  chief: string;
  color: 'orange' | 'yellow' | 'gray';
};

const ANCHOR_DATE = '2026-07-16';
const DAY_MS = 24 * 60 * 60 * 1000;

const ROTATION: ShiftRotation[] = [
  { label: 'First Shift', chief: 'R Brown', color: 'orange' },
  { label: 'Second Shift', chief: 'S Bellot', color: 'yellow' },
  { label: 'Third Shift', chief: 'M Martin', color: 'gray' },
];

function dateAtUtcMidnight(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid schedule date: ${date}`);

  const value = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (new Date(value).toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid schedule date: ${date}`);
  }
  return value;
}

export function getShiftRotation(date: string): ShiftRotation {
  const daysSinceAnchor = Math.round((dateAtUtcMidnight(date) - dateAtUtcMidnight(ANCHOR_DATE)) / DAY_MS);
  return ROTATION[((daysSinceAnchor % ROTATION.length) + ROTATION.length) % ROTATION.length];
}
