## Context

The portal uses Supabase Auth for students, admins, and preceptors. The current role model stores `role` in `user_metadata` and reads that role both in application code and RLS policies. Supabase marks `user_metadata` as user-editable; authorization decisions should use `app_metadata`/`raw_app_meta_data`, which can only be changed through trusted server-side admin APIs.

Current findings:
- `src/lib/roles.ts` reads `user.user_metadata.role`.
- `/auth/callback` directly checks `user.user_metadata.role === 'admin'`.
- Auth creation paths write `user_metadata: { role: ... }` for admin and student users.
- Live database has 25 RLS policies referencing `auth.jwt() -> 'user_metadata' ->> 'role'`.
- Existing live Auth users currently have role values in `raw_user_meta_data`, while `raw_app_meta_data.role` is null.

## Goals / Non-Goals

**Goals:**
- Move all security-sensitive role checks to `app_metadata.role`.
- Preserve existing admin/preceptor/student roles during migration.
- Avoid admin lockout by backfilling app metadata before switching checks.
- Update RLS policies so Supabase security advisors stop reporting `rls_references_user_metadata` for project policies.
- Keep role checking centralized in `src/lib/roles.ts` where possible.

**Non-Goals:**
- Do not redesign the full account model or introduce database-backed role membership tables.
- Do not change student ownership predicates based on `students.auth_user_id`.
- Do not solve unrelated advisor findings such as public bucket listing, security definer functions, or leaked password protection.
- Do not remove existing `user_metadata.role` values in the first pass; leaving them temporarily is harmless once no authorization code trusts them.

## Decisions

### Backfill app metadata before switching checks

The migration should copy current role values from `auth.users.raw_user_meta_data->>'role'` into `auth.users.raw_app_meta_data.role` for existing users where app metadata role is missing.

Rationale:
- The current admin account would otherwise lose admin access when app/RLS checks switch.
- This is the lowest-risk bridge from the current model to the secure model.

Alternative considered: manually update only the known admin user first. This is riskier because it can miss preceptors and future seeded/test accounts.

### Use `app_metadata.role` everywhere for authorization

Update shared role helpers to read `user.app_metadata.role`. Application code should call `canAccessAdmin()` and `canAccessPreceptor()` rather than reading raw metadata inline.

Rationale:
- Centralizing role lookup reduces drift and avoids future direct reads from unsafe metadata.
- Supabase Auth user objects expose `app_metadata`, and RLS can read app metadata from JWT claims via `auth.jwt()`.

### Update RLS policies in place

Add a migration that drops/recreates or alters each policy that references `user_metadata` so it uses `app_metadata` instead. The resulting predicate should be equivalent except for metadata source.

Rationale:
- Keeps existing access behavior while removing the unsafe claim source.
- Minimizes behavioral change across the app.

### Write new roles to app metadata using admin APIs

Use Supabase admin Auth APIs with `app_metadata: { role }` when creating admin, preceptor, and student users.

Rationale:
- Client-side users cannot self-edit app metadata.
- Future users should not depend on the backfill migration.

## Risks / Trade-offs

- Existing sessions may carry stale JWT claims after backfill → Ask admins/preceptors to sign out and back in after deployment, and verify access with a fresh session.
- A migration error in RLS policies can block admin Data API access → Backfill first, apply policies carefully, and verify with advisors and admin UI/API smoke checks.
- Some tests or mocks may only include `user_metadata` → Update tests/mocks to include `app_metadata` role.
- Direct Auth table updates are sensitive → Limit SQL to copying role strings into `raw_app_meta_data` and do not modify passwords, identities, or sessions.

## Migration Plan

1. Add a migration that backfills `auth.users.raw_app_meta_data.role` from `raw_user_meta_data.role` where missing and role is one of `admin`, `preceptor`, or `student`.
2. In the same or subsequent migration, replace all project RLS policy predicates that reference `user_metadata.role` with equivalent `app_metadata.role` predicates.
3. Update app role helpers and direct role checks to read `app_metadata.role`.
4. Update Auth user creation/recreation paths to set `app_metadata.role`.
5. Run tests and build.
6. Apply migration live, verify current Auth users have app metadata roles, sign out/in as admin, and run Supabase security advisors.

Rollback:
- If app access fails before policies are changed, temporarily restore `roles.ts` to read legacy `user_metadata` while preserving the app metadata backfill.
- If RLS access fails, apply a corrective migration restoring the previous policy predicates while investigating.

## Open Questions

- Should the app temporarily support reading legacy `user_metadata.role` only for student routing fallback, or should the switch be strict once the backfill exists? The safer security posture is strict `app_metadata` for all authorization.
