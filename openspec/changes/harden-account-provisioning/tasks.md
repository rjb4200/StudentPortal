## 1. Database hardening

- [x] 1.1 Write a migration that pre-checks and de-duplicates existing `auth_user_id` links across `students`, `admin_accounts`, and `preceptors` before adding constraints
- [x] 1.2 Add FK `students.auth_user_id` → `auth.users(id) ON DELETE SET NULL`
- [x] 1.3 Add partial unique indexes on `auth_user_id` (`WHERE auth_user_id IS NOT NULL`) for `students`, `admin_accounts`, and `preceptors`
- [x] 1.4 Apply the migration in the Supabase dashboard SQL editor (project `ejjsahtohaydoogtilgp`) and update `src/lib/supabase/database.types.ts`

## 2. Provisioning route

- [x] 2.1 Add a single server-side account-provisioning route (admin-authenticated) that accepts account type (admin/preceptor), email, password, role, and profile fields
- [x] 2.2 Implement profile-row-first insertion with `auth_user_id = null`, returning a clear duplicate-email error before any auth user is created
- [x] 2.3 Implement create-or-adopt: look up an existing auth user by email and branch (none → create, unlinked+role-match → adopt, linked/role-mismatch → conflict)
- [x] 2.4 Implement compensation: if the auth user was created in this request and linking fails, delete only that newly created user
- [x] 2.5 Return structured conflict responses naming the owning account type; add the response schema to `src/lib/validation.ts`
- [x] 2.6 Enforce the no-silent-role-change guard: never overwrite an existing user's `app_metadata.role` during adoption

## 3. Account Management UI

- [x] 3.1 Refactor `saveEdit` for admin and preceptor in `src/app/admin/accounts/page.tsx` to call the consolidated provisioning route instead of `create-auth-user` plus a client-side insert
- [x] 3.2 Surface the structured conflict message (owner type) in the form feedback without leaking auth details
- [x] 3.3 Preserve edit, disable, and delete behavior; confirm delete still removes the auth user when linked and leaves no new orphan

## 4. Orphan reconciliation sweep

- [x] 4.1 Extend `src/app/api/cron/sweep/route.ts` to detect auth users with no matching profile by `auth_user_id` or email
- [x] 4.2 Record orphan findings in the run summary and `audit_log`; keep the existing expired-student sweep behavior intact
- [x] 4.3 Add a detect-first mode and a clean mode that deletes only never-signed-in, unlinked orphans; never delete linked users

## 5. System Health reporting

- [x] 5.1 Extend `src/app/api/admin/system-health/route.ts` to return orphan counts (total and never-signed-in) without exposing secrets
- [x] 5.2 Display the orphan metric on the System Health page with healthy/neutral and attention states

## 6. Tests

- [x] 6.1 Route tests: adopt unlinked matching-role user; conflict on linked/role-mismatch; compensation deletes only the request's own user; profile-first duplicate-email error
- [x] 6.2 Spec coverage: create admin/preceptor for an unlinked existing email succeeds; conflict identifies owner; no silent role change
- [x] 6.3 Sweep tests: detect-only mode records count; clean mode deletes only never-signed-in orphans; linked users are never removed
- [x] 6.4 Dual-role tests: admin-with-student-enrollment reaches `/admin` and `/dashboard`; student-only role is denied staff routes

## 7. Verification

- [x] 7.1 Run `npm run test` and `npm run build`
- [ ] 7.2 Manual: create an admin for a known unlinked orphan email and confirm it adopts instead of erroring
- [ ] 7.3 Manual: attempt a duplicate role conflict and confirm the message names the owner and creates nothing
- [ ] 7.4 Manual: simulate a mid-provision failure and confirm no orphaned auth user remains
