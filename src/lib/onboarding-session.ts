import { createHash, randomBytes, randomInt } from 'crypto';

const ONBOARDING_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function generateOnboardingToken() {
  return randomBytes(32).toString('base64url');
}

export function hashOnboardingToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getOnboardingSessionExpiry(now = new Date()) {
  return new Date(now.getTime() + ONBOARDING_SESSION_TTL_MS).toISOString();
}

export function generateTemporaryPin() {
  return String(randomInt(100000, 1000000));
}

export async function createOnboardingSession(adminClient: any, studentId: string) {
  const token = generateOnboardingToken();
  const { error } = await adminClient.from('onboarding_sessions').insert({
    student_id: studentId,
    token_hash: hashOnboardingToken(token),
    expires_at: getOnboardingSessionExpiry(),
  });

  if (error) {
    throw new Error('Failed to create onboarding session');
  }

  return token;
}
