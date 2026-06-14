## Why

The magic link email system is unreliable in production. Emails are inconsistently delivered depending on SMTP configuration, rate limiting, and email client behavior. Students need immediate, reliable access to their login credentials. Replacing magic links with a temporary password system gives students instant credentials on the completion screen and a straightforward username/password login flow, matching the admin and preceptor login pattern already in place.

## What Changes

- Onboarding quiz completion creates a Supabase Auth user with a random 6-digit temporary password. If an auth user already exists for that email (e.g., the person is also an admin), the existing user is reused and no password change is forced.
- The onboarding completion screen displays the student's username (email) and temporary password, or tells them to use existing credentials if they already have an auth account.
- The login page Student tab is converted from magic link to email + password, with a forgot password link.
- The admin approval flow no longer sends a magic link — the student already has credentials.
- First-time student login shows a "Change Your Password" prompt on the dashboard.
- A `/reset-password` page allows any user to set a new password after receiving a reset email.
- The `students` table gains a `password_changed` boolean column to track whether the student has set a permanent password.

## Capabilities

### New Capabilities
- `password-auth-system`: Password-based student authentication with temporary password generation, onboarding credential display, first-login password change, and forgot password reset flow.

### Modified Capabilities
- `authentication-authorization`: Student auth changes from magic link to password-based. Login page Student tab updated. Forgot password flow added.
- `student-onboarding`: Completion screen now displays credentials instead of "check your email" message.

## Impact

- New: `src/app/reset-password/page.tsx`
- Modified: `src/app/api/notify/onboarding-complete/route.ts` — temp password creation, return password
- Modified: `src/components/onboarding/onboarding-complete.tsx` — display credentials
- Modified: `src/app/login/page.tsx` — Student tab: email+password + forgot password link
- Modified: `src/app/api/admin/approve-student/route.ts` — remove magic link
- Modified: `src/app/dashboard/page.tsx` — first-login password change prompt
- Database: `students.password_changed` column added
- No changes to `admin_accounts`, `preceptors`, middleware, RLS, or account management pages.
