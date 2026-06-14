## Why

The shared onboarding token adds friction and creates brittle links without providing meaningful protection, since dashboard access is still controlled by authentication, student status, blacklist state, and expiration checks. Onboarding should be directly reachable at `/onboarding` so students and re-registering users do not need a special query string.

## What Changes

- Remove the `?token=WFD_TRAINING_2026` requirement from the onboarding route.
- Allow anonymous users to access `/onboarding` directly.
- Update all app links and redirects that point to `/onboarding?token=WFD_TRAINING_2026` so they point to `/onboarding`.
- Remove the onboarding token middleware check and related helper code.
- Remove `ONBOARDING_TOKEN` from project documentation as a required environment variable.
- Update specs to describe direct onboarding access instead of token-gated onboarding.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-onboarding`: Onboarding access changes from token-gated to direct anonymous access at `/onboarding`.
- `fix-magic-link-redirects`: Expired student re-registration links now route to `/onboarding` without a token query parameter.

## Impact

- Affects `src/middleware.ts` route protection and redirect behavior.
- Affects hard-coded onboarding links in public, expired, auth callback, and admin dev surfaces.
- Affects `AGENTS.md` project instructions and OpenSpec requirements.
- No database migration, Supabase policy change, or new dependency is expected.
