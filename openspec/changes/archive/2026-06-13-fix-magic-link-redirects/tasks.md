## 1. Magic Link Redirect Fix

- [x] 1.1 Fix `redirect_to` placement in onboarding-complete route
- [x] 1.2 Fix `redirect_to` placement in approve-student route

## 2. Blacklisted Page

- [x] 2.1 Create `/blacklisted` page with removal message

## 3. Expired Page

- [x] 3.1 Create `/expired` page with expiration message and re-register link

## 4. Middleware Updates

- [x] 4.1 Redirect blacklisted students to `/blacklisted` instead of `/onboarding`
- [x] 4.2 Redirect expired students to `/expired` instead of `/onboarding`

## 5. Verification

- [x] 5.1 Verify magic link from onboarding completion redirects to /dashboard
- [x] 5.2 Verify magic link from admin approval redirects to /dashboard
- [x] 5.3 Verify blacklisted student sees /blacklisted page
- [x] 5.4 Verify expired student sees /expired page with re-register link
- [x] 5.5 Run production build and resolve any issues
