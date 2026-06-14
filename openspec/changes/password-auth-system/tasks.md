## 1. Database

- [x] 1.1 Add `password_changed boolean NOT NULL DEFAULT false` to `students` table
- [x] 1.2 Regenerate TypeScript types

## 2. Onboarding Completion

- [x] 2.1 Update API route to create auth user with temp 6-digit password or reuse existing
- [x] 2.2 Return password (or null) in API response
- [x] 2.3 Update OnboardingComplete component to display credentials or "use existing" message

## 3. Login Page

- [x] 3.1 Replace magic link with email + password form on Student tab
- [x] 3.2 Add forgot password link
- [x] 3.3 Validate student email against students table after sign-in
- [x] 3.4 Show appropriate error messages

## 4. Admin Approval

- [x] 4.1 Remove magic link / OTP call from approve-student route
- [x] 4.2 Keep status update and access_until logic unchanged

## 5. Password Change

- [x] 5.1 Add first-login password change prompt to dashboard
- [x] 5.2 Create API route for password change (`POST /api/admin/change-password`)
- [x] 5.3 Allow student to change password from dashboard
- [x] 5.4 Create `/reset-password` page for forgot password flow

## 6. Verification

- [x] 6.1 Verify new student sees credentials on completion screen
- [x] 6.2 Verify existing auth user reuse shows "use existing credentials"
- [x] 6.3 Verify student can log in with temp password on Student tab
- [x] 6.4 Verify student is prompted to change password on first login
- [x] 6.5 Verify forgot password flow works
- [x] 6.6 Verify admin approval doesn't send email
- [x] 6.7 Verify admin account still works via Admin tab
- [x] 6.8 Run production build and resolve any issues
