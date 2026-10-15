import { getShiftKey, type ShiftKey } from '@/lib/shift-rotation';

export type PreceptorLike = {
  id: string;
  shift: ShiftKey | null;
  is_active: boolean;
};

/** Active preceptors assigned to the crew shift that works on `date`. Chiefs are not preceptors and are never included. */
export function poolForDate<T extends PreceptorLike>(date: string, preceptors: T[]): T[] {
  const key = getShiftKey(date);
  return preceptors.filter((preceptor) => preceptor.is_active && preceptor.shift === key);
}

/** The day's pool minus any preceptor already paired with a student that day. */
export function availablePreceptorsForDate<T extends PreceptorLike>(
  date: string,
  preceptors: T[],
  pairedPreceptorIds: Iterable<string>
): T[] {
  const paired = new Set(pairedPreceptorIds);
  return poolForDate(date, preceptors).filter((preceptor) => !paired.has(preceptor.id));
}
