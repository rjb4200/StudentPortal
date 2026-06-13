## Context

Admin accounts are currently created manually via the Supabase dashboard. Preceptors have no auth accounts. Student editing is limited to blacklist/delete/no-show — personal info, status, and other fields are immutable in the UI. Email notifications are hard-coded in API routes.

The `admin-configurable-onboarding-content` change introduced configurable onboarding via database tables with RLS. This change extends the same pattern to account management and notification configuration.

## Goals / Non-Goals

**Goals:**
- Create, edit, disable, and delete admin accounts from the Admin Command Center.
- Create, edit, disable, and delete preceptor accounts with auth logins.
- Edit student personal info, status, blacklist flag, and no-show count.
- Per-account notification preferences that API routes use as recipient lists.
- Password-based auth for admins and preceptors with 1-year JWT expiry.
- Migrate existing `rjb4200@gmail.com` admin into `admin_accounts`.
- Preceptor coming-soon dashboard page.

**Non-Goals:**
- Preceptor full dashboard (coming soon page only).
- Student self-service account editing.
- Role-based access control beyond admin vs preceptor vs student.
- Pushover notification per-account preferences (email only for now).
- Preceptor evaluation assignment or student-preceptor matching.

## Decisions

### 1. Single page with filter tabs, edit via query param

`/admin/accounts` renders three filter tabs (Admin, Preceptors, Students). Clicking an account row navigates to `/admin/accounts?edit=<id>`, which renders the edit form for that account. The list remains visible above or is replaced by the form based on presence of the query param.

**Rationale:** One route avoids routing complexity for 3 account types. The query param makes the edit view bookmarkable and linkable (student roster links to `?edit=<id>`). No new route files needed beyond the one page.

**Alternative considered:** Separate routes (`/admin/accounts/admin/[id]`, etc.). This would require 3+ page files and dynamic route segments with near-identical rendering. Single page with query param is simpler.

### 2. Password-based auth for admins and preceptors via Supabase Auth admin API

`supabase.auth.admin.createUser()` with `password` parameter. No magic link. Admins and preceptors log in via the existing Admin tab on `/login` using email + password.

**Rationale:** Consistent with user preference. Magic links are for students who don't set passwords. Admins and preceptors are internal staff who expect password-based login. The admin API handles user creation server-side via service role — passwords are never stored in the application tables.

### 3. Preceptors use the existing Admin login tab, not a separate tab

The `/login` page Admin tab accepts both admin and preceptor credentials. After sign-in, middleware checks `user_metadata.role` and the login page redirects accordingly: `admin` → `/admin`, `preceptor` → `/preceptor`.

**Rationale:** No UI change to the login page needed. Preceptors are internal staff and the Admin tab is the appropriate entry point. Supabase Auth handles credential validation uniformly.

### 4. `admin_accounts` table separate from `admin_notes`

A new `admin_accounts` table stores admin user metadata and notification preferences. The existing `admin_notes` table (notes about students) is unrelated and unchanged.

**Rationale:** Different domain — account management vs student annotations. Separate table keeps RLS simple.

### 5. Notification preferences stored as boolean columns on admin_accounts and preceptors

Each notification type is a boolean column (e.g., `notify_onboarding_complete`). API routes query `admin_accounts` WHERE `is_active = true AND notify_<event> = true` to build recipient lists.

**Rationale:** Simple, queryable, no JSON config parsing. Adding a new notification type means adding one column — manageable for the limited set of notification types. Boolean columns are easy to render as checkboxes in the UI.

**Alternative considered:** A `notification_settings` table with event_type + recipient rows. More normalized but more complex queries and UI. Over-architected for the current ~5 notification types.

### 6. JWT expiry via Supabase Auth configuration

Set `auth.settings.jwt_expiry` to 31536000 seconds (1 year) via SQL: `UPDATE auth.config SET jwt_exp = 31536000`.

**Rationale:** Global setting. All auth users get the long expiry, which is fine — students are already managed via `access_until` and middleware checks, not JWT expiry. Long sessions for admins/preceptors meet the "once a year" requirement.

### 7. Preceptor auth adds `email` and `auth_user_id` to existing `preceptors` table

Rather than creating a separate `preceptor_accounts` table, we add columns to the existing `preceptors` table. Preceptors without auth accounts have NULL `auth_user_id` and `email`.

**Rationale:** Reuses the existing preceptor management UI (bio, image, station, tags) already in the codebase. The preceptor gallery component already reads from `preceptors`. Adding auth linking makes the same rows usable for login.

### 8. Student edit form on the same accounts page

The Accounts page student section shows the roster with an edit button per student (same as admin and preceptor). The edit form includes all editable fields: full_name, email, phone, school_name, instructor_name, instructor_contact, status, is_blacklisted, no_show_count.

**Rationale:** Unified account management. The Daily Ops roster links to this page so admins have one place to edit student details. The roster remains a quick-read overview in Daily Ops.

## Risks / Trade-offs

- **[Risk] Changing a student's email could orphan their auth user** → Mitigation: The edit form warns if the email differs from the auth user email. Admins can also update the auth user email via the admin API.
- **[Risk] 1-year JWT expiry means revoked accounts can still access for up to 1 year** → Mitigation: Disabling an account sets `is_active = false` and the login page checks this. Middleware can also check `admin_accounts.is_active` for admin/preceptor sessions. Expired JWTs still need the user to be active in the database.
- **[Risk] `generateLink` for magic link conflicts with password accounts** → Mitigation: Admin and preceptor accounts are created with `password` parameter, not `email_confirm`. Magic link generation is only used in student onboarding API routes, which query `student.email`, not admin/preceptor emails.

## Migration Plan

1. Create migration: `admin_accounts` table, alter `preceptors`, RLS, seed `rjb4200@gmail.com`.
2. Set JWT expiry to 1 year via Supabase Auth config.
3. Create `/admin/accounts` page with list + edit views.
4. Update `/admin` page hamburger with "Account Management" link.
5. Update `daily-ops.tsx` roster — student names link to `/admin/accounts?edit=<id>`.
6. Update `login/page.tsx` — role-based redirect after admin tab login.
7. Update `middleware.ts` — allow preceptor role.
8. Create `/preceptor` coming-soon page.
9. Update notification API routes to query `admin_accounts` for recipients.
10. Regenerate types, build, verify.

Rollback: Revert migration. Old hard-coded emails in API routes can be restored.

## Open Questions

- None.
