## Why

The `password-auth-system` change (2026-06-14) replaced magic link authentication with password-based login, but the cleanup was incomplete. Dead code calling `signInWithOtp` remains in `src/lib/auth.ts`, and five active OpenSpec specs still describe magic link authentication as the primary student login mechanism. This misalignment between code and documentation creates confusion and risks future work rebuilding the rejected approach.

## What Changes

- Remove two dead `signInWithOtp` (magic link) calls from `src/lib/auth.ts` `approveStudent()` function
- Rewrite `authentication-authorization` spec: replace magic link requirements with password auth, temp credentials, and forgot-password flow
- Rewrite `onboarding-completion-flow` spec: replace magic link delivery with temp password generation and credential display
- Update `notifications-alerts` spec: remove magic link scenario and parenthetical note
- Remove `fix-magic-link-redirects` spec: entire spec is about magic link behavior that no longer exists
- Update `fix-approve-student-bug` spec: remove magic link references from approval scenario descriptions
- `password-auth-system` spec: no changes needed (already documents the removal)

## Capabilities

### New Capabilities

None — this is purely cleanup, no new functionality.

### Modified Capabilities

- `authentication-authorization`: Replace magic link authentication requirements with password-based auth, temp credentials, and forgot-password flow. Student login scenarios change from "enters email, receives magic link" to "enters email + password."
- `onboarding-completion-flow`: Replace "quiz completion sends auth magic link" with temp password generation and credential display. Login email validation scenarios change from magic link dispatch to student-record lookup + password auth.
- `notifications-alerts`: Remove "Account approval and magic link email" scenario and parenthetical note about magic links being handled by Supabase Auth. Approval no longer sends any email.
- `fix-magic-link-redirects`: Remove entire spec. The redirect behavior this spec defined (magic link → `/dashboard`) is no longer applicable. Non-magic-link scenarios (blacklisted page, expired page) are already covered in `authentication-authorization`.
- `fix-approve-student-bug`: Remove magic link references from approval scenarios. Approval now only updates status and access expiry.

## Impact

- **Code**: `src/lib/auth.ts` — remove `signInWithOtp` calls (lines 29-32, 50-53); function is already dead code (zero imports)
- **Specs**: Five spec files updated, one removed
- **No API, dependency, or infrastructure changes**
- **No breaking changes** — all running code paths already use password auth
- GitHub issue: [#18](https://github.com/rjb4200/StudentPortal/issues/18)
