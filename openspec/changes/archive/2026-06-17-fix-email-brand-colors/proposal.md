## Why

All branded onboarding/admin emails use `#8a1518` for button borders alongside `#A40104` for backgrounds — a second red that isn't in the WFD brand palette. Two evaluation emails have no branding at all. The `buildEmailHtml()` function is copy-pasted identically across two routes with no shared source of truth for brand colors.

## What Changes

- **Replace `#8a1518` with `#A40104`** across all four branded email templates — buttons use a single, consistent crimson
- **Extract `buildEmailHtml()`** from `schedule/cancel` and `schedule-action` into a shared exported function in `src/lib/email.ts` — deduplicate, add brand constants (`LOGO_URL`, `FROM_ONBOARDING`, `FROM_NOREPLY`)
- **Centralize brand colors** in email constants — `EMAIL_CRIMSON = '#A40104'`, `EMAIL_CHARCOAL = '#1C1C1E'`, etc. — so future templates can't accidentally use wrong colors
- **Add WFD branding to evaluation emails** — at minimum the WFD logo header, matching the pattern used by all other emails

## Capabilities

### New Capabilities

- `email-brand-consistency`: Shared email template utility with canonical WFD brand color constants, a reusable `buildEmailHtml()` function, and consistent logo/header across all transactional emails.

### Modified Capabilities

- `student-email-notifications`: All email templates use a single crimson color (`#A40104`) and the shared `buildEmailHtml()` utility — no hardcoded rogue colors

## Impact

- **1 modified file**: `src/lib/email.ts` — add `buildEmailHtml()`, brand constants, logo URL
- **4 modified routes**: `onboarding-complete`, `approve-student`, `schedule/cancel`, `schedule-action` — replace `#8a1518` with `#A40104`, use shared `buildEmailHtml()`
- **2 modified routes**: `evaluation-receipt`, `flagged-evaluation` — add WFD logo header
- **Zero API signature changes**, zero database changes, zero new dependencies
