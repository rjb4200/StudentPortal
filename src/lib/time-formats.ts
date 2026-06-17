export const TIME_12_TO_24: Record<string, string> = {
  '7:00 AM': '0700',
  '8:00 AM': '0800',
  '9:00 AM': '0900',
  '10:00 AM': '1000',
  '11:00 AM': '1100',
  '12:00 PM': '1200',
  '1:00 PM': '1300',
  '2:00 PM': '1400',
  '3:00 PM': '1500',
  '4:00 PM': '1600',
  '5:00 PM': '1700',
  '6:00 PM': '1800',
  '7:00 PM': '1900',
  '8:00 PM': '2000',
  '9:00 PM': '2100',
  '10:00 PM': '2200',
  '11:00 PM': '2300',
};

export function to24Hour(time12: string | null | undefined): string {
  if (!time12) return '';
  return TIME_12_TO_24[time12] || time12;
}

export function abbreviated12(time12: string | null | undefined): string {
  if (!time12) return '';
  return time12.replace(':00 ', '').replace(' AM', 'A').replace(' PM', 'P');
}

export const START_TIME_OPTIONS = Object.keys(TIME_12_TO_24);
export const END_TIME_OPTIONS = Object.keys(TIME_12_TO_24);
