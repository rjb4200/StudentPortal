## Why

Admin/preceptor account creation is a two-step, non-atomic sequence: the browser creates a Supabase Auth user (which globally reserves the email) and then inserts the profile row. If the second step fails or the browser navigates away, the auth user is orphaned and that email is permanently blocked from any future account creation because the create path never checks for an existing user. This actually happened: `mmartin@winchesterky.com` had an orphaned `role = 'preceptor'` auth user with no backing `preceptors` row, and "Add Admin" failed with "A user with this email address has already been registered." This change makes provisioning self-healing, defines how student and staff accounts relate, and removes the orphan failure mode.

## What Changes

- Replace the split "create auth user (browser) then insert profile (browser)" flow with a single server route that owns both steps and rolls back the login it created if the profile insert fails.
- Insert the profile row first and the auth login second, so a mid-flight failure leaves a recoverable profile row rather than a permanently reserved email. `admin_accounts.email` uniqueness catches duplicates before any login is created.
- When an email already has an **unlinked staff login** (an orphan), **delete and recreate** it with the requested role and password instead of adopting it, so the entered role and password apply.
- Require an explicit confirmation before any **staff role change** (preceptor ↔ admin); never change a role silently.
- Keep **student and staff accounts separate**: a single email backs exactly one account family, a person who is both uses distinct emails, and cross-family provisioning or onboarding reuse is refused.
- Restrict onboarding auth reuse to student-role logins; refuse a staff email during student onboarding.
- Add orphan reconciliation to the daily sweep (detect by default, optional clean of never-signed-in orphans) and surface an orphan count on System Health.
- Add DB integrity: FK from `students.auth_user_id` to `auth.users(id) ON DELETE SET NULL`, and partial unique indexes on `auth_user_id` per profile table.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `admin-account-management`: account creation becomes a single server-side operation that replaces unlinked staff logins (delete + recreate), requires confirmation for staff role changes, refuses student emails, and never leaves an orphan.
- `authentication-authorization`: student and staff accounts are separate families using distinct emails; onboarding auth reuse is restricted to student-role logins.
- `system-health-operations-dashboard`: the dashboard reports orphaned auth users and the daily sweep reconciles them.

## Impact

- Routes: `src/app/api/admin/provision-account/route.ts` (new, replaces the split flow), `src/app/api/notify/onboarding-complete/route.ts` (restrict reuse), `src/app/api/cron/sweep/route.ts`, `src/app/api/admin/system-health/route.ts`.
- UI: `src/app/admin/accounts/page.tsx` (confirm prompt for role change / login replacement), `src/app/admin/system/page.tsx` (orphan metric).
- Validation: `src/lib/validation.ts` (conflict response shape).
- Database: one migration adding the `students.auth_user_id` FK and partial unique indexes on `auth_user_id`.
- No changes to login routing or existing RLS semantics beyond the role-family rule.
