## Why

Expired students can re-register with the same email, but the renewal flow reuses their existing Supabase Auth account without unlinking the expired student row. This leaves two student records linked to one auth user and prevents the student from signing in after completing the new wizard and receiving approval.

## What Changes

- Detach expired, archived, or rejected prior enrollment rows from a reused Supabase Auth account before linking that account to the renewed enrollment.
- Preserve prior enrollment rows and their audit history while ensuring exactly one current student row is linked to the Auth user.
- Add regression coverage for an expired student completing onboarding again with existing credentials.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `onboarding-completion-flow`: re-registering students with an existing Auth account retain a single current student-to-auth association after onboarding completion.

## Impact

- `src/app/api/notify/onboarding-complete/route.ts`
- `src/app/api/notify/onboarding-complete/route.test.ts`
- No schema migration or Supabase configuration change is required.
