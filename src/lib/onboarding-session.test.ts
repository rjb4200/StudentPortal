import { describe, expect, it } from 'vitest';
import { generateOnboardingToken, generateTemporaryPin, hashOnboardingToken } from './onboarding-session';

describe('onboarding session helpers', () => {
  it('generates opaque tokens and stable hashes', () => {
    const token = generateOnboardingToken();

    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(hashOnboardingToken(token)).toBe(hashOnboardingToken(token));
    expect(hashOnboardingToken(token)).not.toBe(token);
  });

  it('generates six digit PINs', () => {
    for (let i = 0; i < 25; i += 1) {
      expect(generateTemporaryPin()).toMatch(/^\d{6}$/);
    }
  });
});
