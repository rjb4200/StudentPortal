## Why

The student login flow performs an anonymous pre-auth lookup of `public.students` by email before attempting password authentication. Row-Level Security (RLS) policies on the `students` table have no SELECT grants for anonymous users — both policies require either `auth.uid() = auth_user_id` (requires auth session) or `role = 'admin'` (requires admin JWT). This means the pre-auth query always returns zero rows for unauthenticated users, and every student from a fresh browser session sees "No student registration was found." The issue is particularly visible for approved test records (`is_test_record = true`) but affects all students equally.

## What Changes

- Reorder `handleStudentLogin` to attempt `signInWithPassword` first, then query `students` by `auth_user_id` (authenticated, RLS-compatible) to check status.
- Remove the anonymous `.from('students').ilike('email', ...)` pre-auth lookup entirely.
- After successful auth, check the linked student record's status (`blacklisted`, `expired`, `archived`, `pending`, `certified`) and display the same inline messages currently used — but based on the authenticated query, not the anonymous one.
- If auth succeeds but no student record is linked to the auth user, show a clear message: "Your login account exists but no student registration is linked. Please complete onboarding." with a link to `/onboarding`.
- Add a permanent "Don't have an account? Start Onboarding" link below the login form (alongside the existing "Forgot password?" link).
- On auth failure, the inline error message includes onboarding guidance: "Invalid email or password. Don't have an account? Start Onboarding" with a link to `/onboarding`.

## Capabilities

### New Capabilities

- `auth-first-login`: Reorder student login so password authentication happens before any student-record status check. All student lookups use `auth_user_id` with an authenticated session, ensuring RLS compatibility for all students including test records.

### Modified Capabilities

- `authentication-authorization`: The login flow order changes from anonymous pre-auth email lookup to post-auth `auth_user_id` query. Auth failure messages include onboarding guidance. A new scenario covers the case where auth succeeds but no student record is linked.
- `login-failure-feedback`: The anonymous pre-auth email lookup is removed as a failure-detection mechanism. All status-based inline messages (not-registered, expired, archived, blacklisted) now fire after authentication, not before.

## Impact

- **Files modified**: `src/app/login/page.tsx` only
- **No new files, no new routes, no database migrations, no new dependencies**
- **No API contract changes**
