import { describe, expect, it } from 'vitest';
import { normalizeMapUrl } from '@/lib/station-map-url';

describe('normalizeMapUrl', () => {
  it('uses a public document URL as-is', () => {
    expect(normalizeMapUrl('/resources/station-1.pdf', 'https://portal.example')).toBe('https://portal.example/resources/station-1.pdf');
  });

  it('strips copied iframe attributes from an embed URL', () => {
    expect(normalizeMapUrl('https://maps.example/embed?place=station-1" width="600"', 'https://portal.example')).toBe('https://maps.example/embed?place=station-1');
  });
});
