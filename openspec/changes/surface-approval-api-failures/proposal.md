## Why

The admin Daily Ops approval button treats failed approval API responses as if they succeeded because the UI does not inspect the HTTP status or response body. This can mislead admins when approval fails due to authorization, validation, missing records, or server-side update errors.

## What Changes

- Require the student approval UI to validate the approval API response before refreshing the Action Required list or presenting success behavior.
- Show a useful admin-facing error message when approval fails.
- Keep failed approvals visible in the pending approval queue until the API confirms success.
- Require the approval API route to return structured failure responses for server-side approval update failures.
- Preserve the existing successful approval behavior, including certification, 120-day access expiry, and account-approved email delivery.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `fix-approve-student-bug`: Clarify the approval API and queue response contract so failed API responses are visible and do not trigger success behavior.
- `admin-command-center`: Require the Daily Ops Action Required approval control to surface approval failures to admins.

## Impact

- Affected UI: `src/components/admin/daily-ops.tsx`
- Affected API: `src/app/api/admin/approve-student/route.ts`
- Affected specs: `fix-approve-student-bug`, `admin-command-center`
- No database schema changes or new environment variables are expected.
