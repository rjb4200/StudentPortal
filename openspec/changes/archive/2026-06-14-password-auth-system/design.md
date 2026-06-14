## Context

The magic link system has proven unreliable in production. Emails are inconsistently delivered depending on SMTP configuration, Supabase Auth rate limiting, and email client behavior (Outlook safelinks wrapping, spam filtering). Multiple attempts to fix the `redirect_to` behavior have been unsuccessful. The admin and preceptor login tabs already use password-based auth — switching students to the same pattern unifies the login experience.

## Goals / Non-Goals

**Goals:**
- Replace magic link student auth with email + password login.
- Generate a random 6-digit temporary password at onboarding completion.
- Display credentials immediately on the completion screen.
- Reuse existing auth users when the student's email already has one.
- Add first-login password change prompt on the dashboard.
- Add forgot password reset flow.

**Non-Goals:**
- Changing admin or preceptor login.
- Changing the admin approval logic beyond removing the magic link.
- Adding email notifications for approval (student already has credentials).
- Changing RLS or middleware role checks.
- Adding `app_metadata.roles` or multi-role support.

## Decisions

### 1. Temp password generated server-side, returned in API response

`crypto.randomInt(100000, 999999)` generates the password. It's returned in the API response JSON so the frontend can display it on the completion screen. The password is never stored in the `students` table — only in Supabase Auth.

**Rationale:** The completion screen is shown immediately after the API call returns. The student sees their credentials before leaving the page. No email delivery dependency.

**Alternative considered:** Email the password. Defeats the purpose of replacing magic links — same email delivery issues.

### 2. Existing auth user reuse, no password override

If `auth.users` already has an entry for the student's email, the API route skips user creation and returns `password: null`. The completion screen shows a message: "Use your existing WFD credentials."

**Rationale:** A person who is both an admin and a student uses the same email and same password. Forcing a new temp password would break their admin login. This preserves the existing account.

### 3. Student tab validates against `students` table

After `signInWithPassword` succeeds, the login page queries `students WHERE email = ?`. If found, allow. If not, show "No student account found."

**Rationale:** An auth user might exist for the email (admin account) but have no student row. The Student tab must only allow access if a student record exists. This also blocks expired/blacklisted students at the students table level.

### 4. `password_changed` on the `students` table

A boolean column `password_changed` defaults to `false`. Set to `true` when the student changes their password via the dashboard prompt. The dashboard checks this flag on load.

**Rationale:** Simple boolean is easier than comparing password hashes. The flag is set once and persists. If a student gets a temp password later (account reset), set it back to `false`.

### 5. Forgot password uses Supabase Auth's built-in reset flow

`supabase.auth.resetPasswordForEmail(email)` sends a reset email via Supabase Auth's email system. The reset link redirects to `/reset-password` where the user sets a new password using `supabase.auth.updateUser({ password })`.

**Rationale:** Supabase Auth already has a complete password reset infrastructure. No need to build custom token management. The reset email delivery is less critical than magic links because it's user-initiated (they're expecting it).

### 6. Admin approval no longer sends any email

The approve-student route removes all email/OTP sending. It only updates the student's status to `certified` with a 120-day `access_until`.

**Rationale:** The student already has credentials from the completion screen. The admin approval just unlocks dashboard features. No email needed.

## Risks / Trade-offs

- **[Risk] Student loses temp password before first login** → Mitigation: The forgot password flow lets them reset it. Admin can also reset the password via the account management page.
- **[Risk] Temp password transmitted in API response over HTTPS** → Mitigation: HTTPS encrypts the response. The password is only visible on the completion screen which is shown once.
- **[Risk] Existing admin whose email matches a new student gets their password changed** → Mitigation: The onboarding route checks for existing auth users and reuses them without changing the password. The completion screen tells them to use existing credentials.

## Migration Plan

1. Add `password_changed` column to `students` table.
2. Update onboarding-complete API route (temp password, return password, reuse existing).
3. Update onboarding-complete component (show credentials or existing-user message).
4. Update login page Student tab (email+password form + forgot password link).
5. Update approve-student route (remove magic link).
6. Update dashboard page (first-login password change prompt).
7. Create `/reset-password` page.
8. Create API route for password change on dashboard.
9. Run build and verify.

Rollback: Revert the files and remove the `password_changed` column. The magic link code is preserved in git history.
