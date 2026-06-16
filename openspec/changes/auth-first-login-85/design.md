## Context

The login page's `handleStudentLogin` function performs an anonymous `.from('students').ilike('email', ...)` query before calling `signInWithPassword`. The `students` table has two SELECT RLS policies:

1. `auth.uid() = auth_user_id` — requires an auth session (fails for `anon`)
2. `role = 'admin'` — requires admin JWT (fails for `anon`)

Both policies evaluate to false for unauthenticated users. The pre-auth query always returns zero rows, and every student from a fresh browser session sees the "not-registered" message regardless of their actual status. The issue is most visible with test records but affects all students equally.

The fix: authenticate first, then query `students` by `auth_user_id` with the authenticated session. The RLS policy `auth.uid() = auth_user_id` passes because `auth.uid()` now equals the user's UUID.

## Goals / Non-Goals

**Goals:**
- Make student login work for all valid students, including test records, by performing auth before any student lookup
- Remove the anonymous pre-auth student lookup
- Add a permanent "Don't have an account? Start Onboarding" link to the login form
- Add onboarding guidance to auth-failure messages

**Non-Goals:**
- Changing RLS policies on the `students` table
- Adding new API routes or database functions
- Modifying the middleware or auth callback route (they already query by `auth_user_id`)
- Changing the admin login flow
- Adding a mechanism to check email existence before auth (privacy-preserving design)

## Decisions

### Decision 1: Auth-first with post-auth status check

The new `handleStudentLogin` flow:

```
1. signInWithPassword(email, password)
   ├── FAIL → show "Invalid email or password." + onboarding link
   └── SUCCESS → get user from response
                  ↓
2. Query students by auth_user_id
   ├── NO ROWS → show "Account exists but no student registration linked" + onboarding link
   └── FOUND → 
        ├── is_blacklisted → show blacklisted message
        ├── status = 'expired' → show expired message + re-register link
        ├── status = 'archived' → show archived message + re-register link
        ├── status = 'certified' or 'pending' → redirect to /dashboard
        └── other → show not-registered message
```

**Why**: This order guarantees that the student query always runs with an authenticated session, which passes the `auth.uid() = auth_user_id` RLS policy. The anonymous lookup is eliminated entirely.

**Alternatives considered**:
- Server-side pre-check API route (Option C) — adds a new endpoint, service-role usage on every login, and an extra network round-trip.
- SECURITY DEFINER RPC — requires a database migration and exposes email existence to unauthenticated users.
- Adding an anon-friendly RLS policy — weakens security by allowing unauthenticated probing of student emails.

### Decision 2: Permanent onboarding link on form

A "Don't have an account? Start Onboarding" link is permanently visible below the Sign In button, alongside "Forgot password?". This link is always present, not conditional on login failure.

**Why**: With the pre-auth email lookup removed, the login page can no longer tell a new student "you need to register" before they type a password. A permanent link gives new students a discoverable path to onboarding without requiring them to first type a password and fail.

**Alternatives considered**:
- Conditional link only on auth failure — requires the user to type password first, which is poor UX for new students.
- No link — new students must somehow know the `/onboarding` URL.

### Decision 3: Onboarding link in auth-failure message

When auth fails, the error message includes both "Invalid email or password." and a "Don't have an account? Start Onboarding" link. This repeats the permanent link but in a more prominent context — the user just tried to log in and failed, so they're primed to look for next steps.

**Why**: The permanent link is subtle (small text below the form). The in-message version is more visible right after a failure, when the user is looking for "what now."

### Decision 4: New "no linked record" state

If auth succeeds but no `students` row matches the `auth_user_id`, the login page now shows a specific message: "Your login account exists but no student registration is linked. Please complete onboarding." This is a new state that didn't exist before (the anonymous pre-check would have caught this as "not-registered").

**Why**: This state is reachable for users who have a Supabase Auth account (e.g., from a previous semester) but no linked `students` row (e.g., their record was archived and unlinked, or they were deleted and re-created). The message is distinct from "invalid password" to avoid confusion.

## Risks / Trade-offs

- **[Risk] RLS query by auth_user_id may still fail for edge cases** → If a student has `auth_user_id = NULL` (not yet linked), the authenticated query won't find them. Mitigation: This state only occurs before admin approval, and the onboarding flow handles it. Students in this state should not be logging in yet.
- **[Risk] Auth-first means the `REASON_MESSAGES['not-registered']` constant is now unused for its original pre-auth purpose** → It is repurposed for the "no linked record" post-auth state with updated text. The key name `not-registered` is kept but the message changes.
- **[Trade-off] Can't distinguish "wrong password" from "email doesn't exist"** → Both show the same "Invalid email or password." message. This is intentional — it prevents email enumeration. The onboarding link provides an escape hatch for genuinely new users.
