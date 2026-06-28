## Context

The onboarding flow generates a random 256-bit `onboardingToken` at registration (`src/lib/onboarding-session.ts`) and persists its SHA-256 hash in `onboarding_sessions`. The completion route (`/api/notify/onboarding-complete`) verifies this token before finalizing onboarding. The legal-signature route does not — it accepts any `studentId` UUID and writes via admin client.

## Goals / Non-Goals

**Goals:**
- Require `onboardingToken` on the legal-signature endpoint (matching completion pattern)
- Enable RLS on `student_legal_acceptances` to close the exposed table
- Preserve the admin client usage (service role is correct for this server-only operation)

**Non-Goals:**
- Changing the frontend token storage (already in `wfd_onboarding_session` localStorage)
- Switching to anon client (service role is appropriate here since the route needs to write to `students` table for signature fields)
- Adding rate limiting or IP restrictions

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Token verification | `hashOnboardingToken()` + `onboarding_sessions` query | Identical pattern to completion route; prevents replay and forgery |
| Session checks | Exists + not expired + not completed | Same three checks as completion route for consistency |
| Admin client | Keep `createAdminClient()` | Route needs to update `students.signature_ip` and `students.signature_timestamp`, which are admin-only fields |
| RLS approach | `ENABLE ROW LEVEL SECURITY` with no policies | Service role bypasses RLS; no client-side PostgREST reads exist; default-deny is correct |
| Schema change | Add `onboardingToken: z.string().min(32).max(256)` | Matches `onboardingCompleteBody` length constraints |

## Risks / Trade-offs

- **Frontend must pass token**: The LegalWaiver component already has the token in the onboarding session. → Mitigation: `handleLegalComplete` in the onboarding page already has `onboardingToken` in scope; just needs to include it in the POST body.
- **Existing incomplete sessions**: Students mid-onboarding during deploy could have a token → No issue; token is generated at registration and stored in localStorage and `onboarding_sessions`.
