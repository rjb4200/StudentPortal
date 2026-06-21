## 1. Database And Types

- [x] 1.1 Create a Supabase migration for an `onboarding_sessions` table with `student_id`, `token_hash`, `expires_at`, `completed_at`, and timestamps.
- [x] 1.2 Enable RLS on `onboarding_sessions` and keep direct public access closed.
- [x] 1.3 Regenerate or update Supabase TypeScript types for the new table.

## 2. Onboarding Session Token Creation

- [x] 2.1 Add server-side helpers to generate an opaque onboarding token and store only its hash.
- [x] 2.2 Update the registration completion path to create an onboarding session for the returned `studentId`.
- [x] 2.3 Return the raw onboarding token to the browser only once with the registration result.
- [x] 2.4 Persist `studentId`, `email`, and `onboardingToken` in the existing local onboarding session storage.

## 3. Completion Endpoint Hardening

- [x] 3.1 Add validation for `POST /api/notify/onboarding-complete` requiring `studentId` and `onboardingToken`.
- [x] 3.2 Verify the token hash matches an active, unexpired, incomplete onboarding session for the submitted `studentId` before service-role auth work.
- [x] 3.3 Verify the student is pending, not blacklisted, not already completed, and has required legal completion state before auth creation/linking.
- [x] 3.4 Mark the onboarding session completed when auth linking and `onboarding_completed_at` recording succeeds.
- [x] 3.5 Reject missing, expired, mismatched, consumed, and repeated completion attempts without returning PIN credentials.

## 4. PIN Preservation And Safety

- [x] 4.1 Replace `Math.random()` PIN generation with crypto-secure 6-digit PIN generation.
- [x] 4.2 Preserve PIN email delivery for newly created auth accounts.
- [x] 4.3 Preserve PIN display on the completion screen for verified sessions.
- [x] 4.4 Ensure logs and error payloads do not include the raw PIN or onboarding token.

## 5. Frontend Wiring

- [x] 5.1 Pass `onboardingToken` from onboarding page state into `KnowledgeGate`.
- [x] 5.2 Send `studentId` and `onboardingToken` to `/api/notify/onboarding-complete`.
- [x] 5.3 Display a clear restart/help error when completion proof is missing, expired, mismatched, or already consumed.
- [x] 5.4 Keep the normal completion screen, PIN credentials box, and Continue to Dashboard flow unchanged for valid sessions.

## 6. Verification

- [x] 6.1 Add or update tests for authorized completion returning a PIN.
- [x] 6.2 Add or update tests for missing/wrong/expired/consumed onboarding token rejection.
- [x] 6.3 Add or update tests for crypto-secure PIN shape and no PIN/token leakage in error responses.
- [x] 6.4 Run `npm run test`.
- [x] 6.5 Run `npm run build`.
