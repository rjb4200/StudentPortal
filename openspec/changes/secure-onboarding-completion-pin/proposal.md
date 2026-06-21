## Why

`POST /api/notify/onboarding-complete` currently performs service-role onboarding completion work using only a caller-supplied `studentId`. This allows an unauthenticated caller with a valid or guessed student UUID to complete another student record and trigger PIN/password creation.

## What Changes

- Add server-verifiable onboarding ownership proof for the student registration session.
- Require onboarding completion requests to include proof that matches the student being completed.
- Preserve the existing PIN behavior: the generated PIN is still emailed to the student and displayed on the completion screen for the verified completing session.
- Generate the 6-digit PIN with a cryptographically secure random source instead of `Math.random()`.
- Reject missing, invalid, expired, already-used, or mismatched onboarding completion proof before using the service-role admin client to create/link auth users.
- Keep the normal student and admin experience unchanged for valid onboarding sessions.
- Show a clear retry/start-over/help error when the onboarding session cannot be verified.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication-authorization`: Temporary PIN creation and return must be limited to verified onboarding sessions.
- `onboarding-completion-flow`: Quiz completion must verify onboarding ownership before completing the student record, while preserving PIN email/display behavior.
- `onboarding-auto-login`: Auto-login from the completion screen remains available only for verified sessions that receive a generated PIN.
- `password-auth-system`: Temporary PIN generation remains part of onboarding, but must use secure randomness and verified completion.
- `student-onboarding`: Student-facing completion behavior remains familiar while invalid/stale/tampered completion attempts are rejected.

## Impact

- Affected code: registration/onboarding session handling, `/api/notify/onboarding-complete`, `KnowledgeGate`, `OnboardingComplete`, validation schemas, email template call sites, and related tests.
- Affected database: add storage for onboarding completion proof, either as fields on `students` or a small `onboarding_sessions` table.
- Affected specs: update existing requirements that currently allow temp PIN return without requiring onboarding ownership proof.
- No removal of PIN email, PIN display, or the current completion screen happy path is intended.
