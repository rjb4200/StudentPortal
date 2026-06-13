## Why

Admin accounts, preceptor accounts, and email notification recipients are currently managed manually through the Supabase dashboard. There is no way to create, edit, or disable accounts from within the Admin Command Center. Student information (name, email, school, instructor) cannot be edited — only blacklist/delete/no-show actions exist. Preceptors have no auth accounts and cannot log in. Email notification recipients are hard-coded in API routes with no configurability.

## What Changes

- Create an Account Management page at `/admin/accounts` that lists all admin, preceptor, and student accounts in three filterable sections with relevant info tags.
- Clicking an account row opens an edit form (query param `?edit=<id>`) for editing that account's fields, notification preferences, and status.
- Admin accounts support password-based auth with long sessions (1 year JWT expiry). Create, edit, disable, and delete admin accounts via Supabase Auth admin API.
- Preceptor accounts gain email, auth user ID, and notification preference columns. Create preceptor auth users with password-based login. Preceptors use the existing Admin login tab.
- Student editing: change full name, email, phone, school, instructor, instructor contact, status, blacklist flag, and no-show count.
- Student names in the Daily Ops roster become clickable links to their edit page on `/admin/accounts?edit=<id>`.
- API notification routes read recipients from `admin_accounts` and `preceptors` instead of hard-coded emails.
- Migrate the existing `rjb4200@gmail.com` admin auth user into the new `admin_accounts` table.
- Create a coming-soon preceptor dashboard at `/preceptor`.

## Capabilities

### New Capabilities
- `admin-account-management`: Admin ability to create, edit, disable, and delete admin accounts, preceptor accounts, and edit student accounts from a unified account management interface. Includes per-account notification preferences and email recipient configuration.

### Modified Capabilities
- `authentication-authorization`: Preceptor role added to middleware and login redirect logic. JWT expiry extended to 1 year for admin/preceptor accounts.
- `notifications-alerts`: Notification routes read recipients from database instead of hard-coded values.

## Impact

- New table: `admin_accounts` with RLS policies.
- Altered table: `preceptors` — add `email`, `auth_user_id`, `notify_evaluation`, `notify_schedule_approved`.
- New pages: `/admin/accounts`, `/preceptor`.
- Modified: `src/middleware.ts`, `src/app/login/page.tsx`, `src/app/admin/page.tsx`, `src/components/admin/daily-ops.tsx`.
- Modified API routes: `onboarding-complete`, `flagged-evaluation`, `evaluation-receipt`.
- Supabase Auth: JWT expiry set to 1 year.
- Database seed: migrate `rjb4200@gmail.com` into `admin_accounts`.
