## Why

When the Resend email API is unreachable (DNS failure, network error, rate limit), five API routes crash AFTER completing irreversible state changes — leaving auth users orphaned, shifts processed but unconfirmed, and students seeing broken UI. The root cause: email sending is not decoupled from the critical-path operations that precede it.

## What Changes

- **Split the monolithic try/catch** in `/api/notify/onboarding-complete` so auth creation and DB writes succeed independently of email delivery. Email failures log and continue — they never roll back the success response or the password in the API payload.
- **Wrap bare Resend `fetch()` calls** in `/api/admin/approve-student`, `/api/schedule/cancel`, and `/api/admin/schedule-action` in try/catch so a network blip doesn't crash an already-processed state change.
- **Extract a shared `sendEmail()` utility** to DRY up the five duplicated Resend fetch patterns, add a configurable timeout, and centralize error logging.
- **Surface errors in the frontend** instead of silently swallowing them with empty `catch {}` blocks in `knowledge-gate.tsx`.

## Capabilities

### New Capabilities

- `resilient-email-delivery`: Email sending is a non-blocking, best-effort side effect. Critical state changes (auth creation, DB updates) succeed independently of email delivery. All Resend API calls are wrapped with try/catch, timeout, and structured error logging.

### Modified Capabilities

- `student-email-notifications`: Relaxes the requirement that email "shall" be sent — emails are best-effort. The system guarantees delivery of credentials via the API response payload, not solely via email.
- `onboarding-completion-flow`: Onboarding completion returns success (and the temp password) even when Resend is unavailable. The auth user is created and linked regardless.
- `admin-shift-management`: Approve/reject/cancel operations on schedules succeed even when the notification email fails.

## Impact

- **5 API routes**: `notify/onboarding-complete`, `admin/approve-student`, `schedule/cancel`, `admin/schedule-action`, `notify/evaluation-receipt` (+ `notify/flagged-evaluation` for timeout parity)
- **1 utility**: New `src/lib/email.ts` shared Resend helper
- **1 frontend component**: `knowledge-gate.tsx` — surface fetch errors instead of empty catch
- **No database changes**, no new dependencies
