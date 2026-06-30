## Why

Admin and preceptor authorization currently depends on Supabase Auth `user_metadata.role`, including many RLS policies. Supabase documents `user_metadata` as user-editable, so using it for authorization creates an avoidable privilege-escalation risk that security advisors now flag across the project.

## What Changes

- Move role-based authorization decisions from `user_metadata.role` to protected `app_metadata.role`.
- Backfill existing Supabase Auth users so current admin, preceptor, and student roles are preserved in `raw_app_meta_data` before application and RLS checks switch over.
- Update shared role helpers, auth callback routing, middleware/API/page access checks, and login role routing to use `app_metadata` through the shared helper.
- Update admin-created Auth users and onboarding-created student Auth users to write roles to `app_metadata` instead of `user_metadata`.
- Replace RLS policy predicates that reference `auth.jwt()->user_metadata->role` with `auth.jwt()->app_metadata->role`.
- Verify Supabase advisors no longer report `rls_references_user_metadata` for project RLS policies.

## Capabilities

### New Capabilities

### Modified Capabilities
- `authentication-authorization`: Role-based access control and RLS authorization SHALL use protected app metadata instead of user-editable user metadata.
- `data-management`: Database RLS admin policies SHALL use protected app metadata for admin role checks.

## Impact

- Auth metadata: existing users need `raw_app_meta_data.role` populated from current role metadata before checks switch.
- App authorization: `src/lib/roles.ts`, `/auth/callback`, admin/preceptor login routing, middleware, and all API/page checks that use shared role helpers.
- Auth user creation: onboarding, admin account creation, and auth-user recreation paths.
- Database: migration replacing RLS policies across admin-managed public tables.
- Supabase security: run advisors after migration to verify `user_metadata` RLS warnings are removed.
- User sessions: admins and preceptors may need to sign out and back in after deployment so JWT app metadata claims refresh.
