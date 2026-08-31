## 1. Email Template

- [x] 1.1 Add `buildMouAwaitingAdminSignatureEmail` to `src/lib/email-templates.ts` with params: `site_name`, `class_name`, `instructor_name`, `training_organization_name`, `admin_portal_url`
- [x] 1.2 Add corresponding test in `src/lib/email-templates.test.ts` covering subject line, body content, and safe HTML escaping

## 2. API Route Integration

- [x] 2.1 Import `sendEmail` and `buildMouAwaitingAdminSignatureEmail` in `src/app/api/instructor/register/route.ts` plus the server-side environment client
- [x] 2.2 After MOU insert succeeds (line ~196), query `admin_accounts` for active admins with `notify_class_mou = true`, then send the email following the same fire-and-forget pattern used in `sign-mou/route.ts`
- [x] 2.3 Add `publicEnv` import (already available in other routes) to resolve `SITE_URL` for the admin portal link
- [x] 2.4 Ensure email send runs in a try/catch so any email delivery failure does not affect the registration response

## 3. Verification

- [x] 3.1 Run `npm run build` to verify no TypeScript or bundling errors
- [x] 3.2 Run `npm run test` to verify all existing tests pass and new template tests pass
- [ ] 3.3 Manual verification: submit an instructor registration and confirm email arrives to opted-in admins (or check Resend dashboard for delivery)
