## Context

The `password-auth-system` change (archived 2026-06-14) successfully migrated the running code paths to password-based student authentication. The onboarding-complete route creates auth users with random passwords, the login page accepts email+password, and the admin approval route only updates status. However, two artifacts of the old magic link system remain:

1. `src/lib/auth.ts` `approveStudent()` — a dead function (zero imports) containing two `signInWithOtp` calls
2. Five OpenSpec specs describing magic link authentication as the active mechanism

This cleanup is documentation alignment and dead code removal. No running behavior changes.

## Goals / Non-Goals

**Goals:**
- Remove all active `signInWithOtp` (Supabase OTP/magic link) calls from application code
- Align OpenSpec specs with the actual password-based auth flow
- Ensure future developers find no references suggesting magic links are the current auth mechanism

**Non-Goals:**
- Changing the running auth flow (it already uses passwords)
- Modifying Supabase Auth provider configuration
- Updating archived change artifacts (historical record)
- Adding new auth features

## Decisions

### Decision 1: Remove dead `signInWithOtp` calls rather than the entire function

`approveStudent()` in `src/lib/auth.ts` contains two `signInWithOtp` calls but is imported nowhere. Options:

| Option | Pros | Cons |
|--------|------|------|
| Remove `signInWithOtp` calls only | Preserves the function for potential future use | Leaves unused function in codebase |
| Remove entire `approveStudent()` | Cleanest; no dead code | Function may have been kept intentionally as a shared utility |

**Decision: Remove `signInWithOtp` calls only.** The function is part of the auth utility module and may be intentionally retained as a reference pattern for the `admin.createUser` workflow. Removing just the magic link calls achieves the issue goal with minimal scope. The function's dead-code status can be addressed separately.

### Decision 2: Use MODIFIED delta operations, not full rewrites

For the five active specs, we write delta files (`## MODIFIED Requirements` / `## REMOVED Requirements`) rather than replacing the full spec files. This preserves the change history and makes the archive step clean.

### Decision 3: Remove `fix-magic-link-redirects` spec entirely

The entire spec is about magic link redirect behavior. Its non-magic-link content (blacklisted page, expired page) is already covered by `authentication-authorization`. Full removal with REMOVED delta.

### Decision 4: Keep `password-auth-system` spec as-is

Its line 51 ("Admin approval no longer sends magic link") is a removal note, not an active reference. This matches the acceptance criteria: "except migration notes explicitly stating the approach was removed."

## Risks / Trade-offs

- **[Risk] `fix-magic-link-redirects` spec removal may orphan the blacklisted/expired page scenarios** → Mitigation: Verified these scenarios already exist in `authentication-authorization` spec (lines 96-108) and middleware implementation.
- **[Risk] Removing `signInWithOtp` from `auth.ts` removes the last reference to the OTP pattern** → Mitigation: Acceptable — the pattern was deliberately deprecated. Git history preserves the implementation.
- **[Risk] Delta specs may conflict with existing spec content during archive** → Mitigation: MODIFIED blocks contain the full updated requirement text, preventing partial-content issues.
