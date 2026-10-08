## Why

Admin/preceptor account creation is a two-step, non-atomic sequence: the browser creates a Supabase Auth user (which globally reserves the email) and then inserts the profile row. If the second step fails or the browser navigates away, the auth user is orphaned and that email is permanently blocked from any future account creation because the create path never checks for an existing user. This actually happened: `mmartin@winchesterky.com` had an orphaned `role = 'preceptor'` auth user with no backing `preceptors` row, and "Add Admin" failed with "A user with this email address has already been registered." This change makes provisioning self-healing and removes the orphan failure mode.

## What Changes

- Replace the split "create auth user (browser) then insert profile (browser)" flow with a single server route that owns both steps and rolls back the auth user it created if the profile insert fails.
- Insert the profile row first and create the auth user second, so a mid-flight failure leaves a recoverable profile row rather than a permanently reserved email. `admin_accounts.email` uniqueness catches duplicates before any auth user is created.
- Make provisioning **create-or-adopt**: look up an existing auth user by email before creating. Adopt and link an unlinked user; refuse with a structured conflict when the email already belongs to another role/profile. This heals any orphan that slips through.
- Never silently change an existing user's role during creation/adoption. Linking an email that already belongs to a student/preceptor requires explicit admin choice.
- Add orphan reconciliation to the daily sweep (and surface an orphan count on the System Health page) as defense in depth.
- Make explicit that a person MAY be both a student and staff: `app_metadata.role` is a capability ceiling (`student` < `preceptor` < `admin`) and student status is an orthogonal `students.auth_user_id` link. Fix the account UI so staff creation does not collide with an existing student enrollment for the same email.
- Add DB integrity: FK from `students.auth_user_id` to `auth.users(id) ON DELETE SET NULL`, and partial unique indexes on `auth_user_id` per profile table.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `admin-account-management`: account creation becomes a single server-side create-or-adopt operation with compensation, profile-row-first ordering, structured email-conflict handling, and a no-silent-role-change guard.
- `authentication-authorization`: role is defined as a capability ceiling with student status as an orthogonal enrollment link, so one auth user can be both student and staff; role adoption never overwrites an existing owner.
- `system-health-operations-dashboard`: the dashboard reports orphaned auth users (users with no matching profile) and the daily sweep reconciles them.

## Impact

- Routes: `src/app/api/admin/create-auth-user/route.ts` (replaced/extended), new consolidated account-provisioning route, `src/app/api/cron/sweep/route.ts`, `src/app/api/admin/system-health/route.ts`.
- UI: `src/app/admin/accounts/page.tsx` (admin/preceptor save flow stops calling auth directly).
- Validation: `src/lib/validation.ts` (conflict response shape).
- Database: one migration adding the `students.auth_user_id` FK and partial unique indexes on `auth_user_id`.
- No changes to login, middleware gating, or existing RLS semantics beyond documentation of the role model.
