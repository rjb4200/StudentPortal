## Why

Student-entered data from onboarding forms (name, email, school) flows into email HTML via JS template literals with zero escaping across 15+ interpolation points in 6 route files. A name containing `<`, `>`, `&`, or `"` will corrupt the email markup or render unpredictably. The two most heavily-used email routes (`approve-student` and `onboarding-complete`) copy-paste the same 264-line WFD branded layout instead of using the shared `buildEmailHtml()` helper. The `message_templates` database table is unused by the email pipeline — transactional email content is scattered across route handlers. This is a security and maintainability issue that must be fixed before the portal goes into production use with real student data.

## What Changes

- Add an `escHtml()` function to `src/lib/email.ts` for HTML-safe string formatting
- Add optional `ctaText` parameter to `buildEmailHtml()` so routes can customize CTA button text without duplicating the layout
- Create `src/lib/email-templates.ts` with 10 typed template builder functions covering every transactional email the system sends
- Refactor all 6 email-sending API routes to call template functions instead of building HTML inline — eliminating ~225 lines of duplicated/unescaped HTML
- Apply WFD branding (via `buildEmailHtml()`) to 3 admin notification emails that currently send bare `<p>` tags with no branding
- Unit tests for `escHtml()` and each template function verifying that special characters in student data do not break email markup

## Capabilities

### New Capabilities
- `safe-email-formatting`: HTML escaping of all student-provided data in email templates; centralized typed template functions that guarantee safe rendering

### Modified Capabilities
- `email-brand-consistency`: Extend `buildEmailHtml()` usage mandate from schedule routes only to ALL transactional email routes (including approve-student, onboarding-complete, and admin notifications)
- `student-email-notifications`: Add requirement that all student data inserted into email HTML SHALL be HTML-escaped so user-entered values cannot break email markup

## Impact

- **Modified files**: `src/lib/email.ts` (add `escHtml`, `ctaText` param), `src/app/api/admin/approve-student/route.ts`, `src/app/api/notify/onboarding-complete/route.ts`, `src/app/api/schedule/cancel/route.ts`, `src/app/api/admin/schedule-action/route.ts`, `src/app/api/notify/evaluation-receipt/route.ts`, `src/app/api/notify/flagged-evaluation/route.ts`
- **New files**: `src/lib/email-templates.ts`, delta specs for `email-brand-consistency` and `student-email-notifications`, new spec `safe-email-formatting`
- **No database changes**, no migrations, no new dependencies
- **No breaking changes**: email subjects, recipients, and visual appearance remain identical — only the HTML construction mechanism changes
