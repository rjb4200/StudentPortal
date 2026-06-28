## Why

The `/api/onboarding/legal-signature` route uses the admin client (service role, bypassing RLS) and accepts unsigned legal acceptances with only `studentId` — no `onboardingToken` verification. Any caller who knows a valid student UUID can impersonate that student and forge legal signatures. Every other onboarding step after registration verifies the token; legal signature is the only step that skips it. Additionally, `student_legal_acceptances` has RLS completely disabled.

## What Changes

- Add `onboardingToken` to the `legalSignatureBody` Zod schema (matching `onboardingCompleteBody`)
- Verify the token in the API route by querying `onboarding_sessions` via `hashOnboardingToken()`, validating session exists, not expired, and not completed
- Enable RLS on `student_legal_acceptances` so PostgREST access is blocked by default (API route uses admin client and is unaffected)
- **BREAKING**: The legal-signature API now requires `onboardingToken` — the frontend caller must provide it

## Capabilities

### New Capabilities

- `legal-signature-token-verification`: Onboarding session token verification in the legal-signature API route

### Modified Capabilities

- `legal-signature-recording`: The legal-signature recording capability SHALL require an onboarding session token to prove student session ownership

## Impact

- **Modified**: `src/lib/validation.ts` — add `onboardingToken` to `legalSignatureBody`
- **Modified**: `src/app/api/onboarding/legal-signature/route.ts` — token verification logic
- **Modified (migration)**: `student_legal_acceptances` — enable RLS
