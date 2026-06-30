## 1. Database Migration

- [x] 1.1 Create a Supabase migration that backfills `auth.users.raw_app_meta_data.role` from `raw_user_meta_data.role` for existing `admin`, `preceptor`, and `student` roles when app role is missing.
- [x] 1.2 Update all public RLS policies that reference `auth.jwt() -> 'user_metadata' ->> 'role'` to use `auth.jwt() -> 'app_metadata' ->> 'role'` instead.
- [x] 1.3 Apply the migration to the live Supabase project.
- [x] 1.4 Verify live Auth users have expected `raw_app_meta_data.role` values before switching application checks.

## 2. Application Role Checks

- [x] 2.1 Update `src/lib/roles.ts` to read `app_metadata.role` and ignore `user_metadata.role` for authorization.
- [x] 2.2 Replace direct `user_metadata.role` checks, including `/auth/callback`, with the shared role helper.
- [x] 2.3 Update tests and mocks that construct role-bearing users to use `app_metadata.role`.

## 3. Auth User Creation

- [x] 3.1 Update admin account creation to set `app_metadata.role = 'admin'`.
- [x] 3.2 Update preceptor account creation, if routed through the same API, to set `app_metadata.role = 'preceptor'`.
- [x] 3.3 Update onboarding student Auth user creation and auth-user recreation to set `app_metadata.role = 'student'`.

## 4. Verification

- [x] 4.1 Run `npm run test`.
- [x] 4.2 Run `npm run build`.
- [x] 4.3 Run Supabase security advisors and verify `rls_references_user_metadata` findings are removed for project RLS policies.
- [ ] 4.4 Smoke-test admin login/access after refreshing the admin session.
- [x] 4.5 Document that admins/preceptors should sign out and back in after deployment if their current session has stale JWT claims.
