## 1. Update REASON_MESSAGES constant

- [x] 1.1 Add `account-no-link` entry to `REASON_MESSAGES`: "Your login account exists but no student registration is linked. Please complete onboarding." with action "Start Onboarding" → `/onboarding`
- [x] 1.2 Update `not-registered` entry to the new post-auth message format (same text, repurposed for fallback)

## 2. Reorder handleStudentLogin to auth-first

- [x] 2.1 Remove the anonymous pre-auth `.from('students').ilike('email', ...)` lookup and all its status-check branches (no-record, blacklisted, archived/expired)
- [x] 2.2 Move `signInWithPassword` to the top of the function — authenticate before any student lookup
- [x] 2.3 On auth success, query `students` by `auth_user_id = user.id` and select `status, is_blacklisted`
- [x] 2.4 On auth failure, show "Invalid email or password." with a "Don't have an account? Start Onboarding" link to `/onboarding`
- [x] 2.5 If student query returns no row, show `REASON_MESSAGES['account-no-link']` message
- [x] 2.6 If student found, check `is_blacklisted`, `status` (expired, archived, certified, pending) and show the corresponding inline message or redirect to `/dashboard`

## 3. Add permanent onboarding link to login form

- [x] 3.1 Add a "Don't have an account? Start Onboarding" link below the Sign In button on the Student tab form, styled consistently with the existing "Forgot password?" link

## 4. Verification

- [x] 4.1 Run `npm run build` and confirm zero errors
- [x] 4.2 Verify the anonymous pre-auth `.ilike('email', ...)` query is completely removed from `handleStudentLogin`
- [x] 4.3 Verify the permanent onboarding link renders on the Student tab
