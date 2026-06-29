import { describe, expect, it } from 'vitest';
import { getLinkedTrainingClass } from '@/lib/training-class-link';

const options = [
  { id: 'class-a', label: 'Site A - Class A' },
  { id: 'class-b', label: 'Site B - Class B' },
];

describe('getLinkedTrainingClass', () => {
  it('returns the matching visible class option', () => {
    expect(getLinkedTrainingClass(options, 'class-b')).toEqual(options[1]);
  });

  it('trims the linked class id', () => {
    expect(getLinkedTrainingClass(options, ' class-a ')).toEqual(options[0]);
  });

  it('returns null for missing or unavailable class ids', () => {
    expect(getLinkedTrainingClass(options, null)).toBeNull();
    expect(getLinkedTrainingClass(options, '')).toBeNull();
    expect(getLinkedTrainingClass(options, 'expired-class')).toBeNull();
  });
});
