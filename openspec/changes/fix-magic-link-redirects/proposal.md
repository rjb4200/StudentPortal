## Why

Magic links sent after onboarding completion and admin approval redirect to the home page instead of the dashboard because `redirect_to` is nested inside `options` instead of being at the top level of the OTP request body. Blacklisted and expired students are redirected to the onboarding page which requires a token parameter, causing an "Access Denied" dead end instead of a meaningful message.

## What Changes

- Fix `redirect_to` placement in the OTP request body for both onboarding-complete and approve-student API routes.
- Create `/blacklisted` page — a simple page informing the student their account has been removed, with no further actions.
- Create `/expired` page — a simple page informing the student their access has expired, with a link to re-register via onboarding.
- Update middleware to redirect blacklisted students to `/blacklisted` and expired students to `/expired` instead of `/onboarding`.

## Capabilities

### New Capabilities
- `fix-magic-link-redirects`: Proper magic link redirect handling and dedicated blacklisted/expired pages.

### Modified Capabilities
*(None — this is a bug fix and UX improvement.)*

## Impact

- Modified: `src/app/api/notify/onboarding-complete/route.ts` — fix `redirect_to`
- Modified: `src/app/api/admin/approve-student/route.ts` — fix `redirect_to`
- New: `src/app/blacklisted/page.tsx`
- New: `src/app/expired/page.tsx`
- Modified: `src/middleware.ts` — redirect to dedicated pages
