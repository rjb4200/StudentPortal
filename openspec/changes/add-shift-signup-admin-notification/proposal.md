## Why

Students submit shift requests that create pending schedule rows, but no admin is notified. Admins must manually check the Action Required feed to discover new signups, which means requests can be missed. The abandoned `notify_sms_schedule_requests` SMS toggle confirms this notification was always intended — it just needs the email equivalent.

## What Changes

- Add `notify_schedule_requested` boolean column to `admin_accounts` (default `true` — signups should not be missed).
- In the `POST /api/schedule/request` route, after inserting the pending schedule, query active admins with `notify_schedule_requested = true` and send them a branded email with the student name, date, shift type, and time range.
- Add `buildShiftRequestedAdminEmail` function to `src/lib/email-templates.ts` following the existing admin-notification pattern (same layout as `buildShiftCancelledByStudentAdminEmail`).
- Expose the `notify_schedule_requested` toggle in the admin Account Management page alongside the other notification preferences.
- Update the database types and apply a migration.

## Capabilities

### New Capabilities

- `admin-shift-signup-notification`: Email notification to subscribed admins when a student submits a shift request. Covers the database toggle column, email template, API route integration, and admin preferences UI.

### Modified Capabilities

- `student-email-notifications`: New requirement for admin notification on shift request submission, mirroring the existing admin-notification-on-student-cancellation pattern.
- `admin-account-management`: Account Management exposes the new `notify_schedule_requested` toggle in the notification preferences form.

## Impact

- Affected code: `src/app/api/schedule/request/route.ts`, `src/lib/email-templates.ts`, `src/lib/supabase/database.types.ts`, admin Account Management page.
- Database: new `notify_schedule_requested` column on `admin_accounts` (migration + live application).
- Email delivery is best-effort: the schedule insert succeeds regardless of email outcome (same pattern as cancellation notifications).
- Verification: `npm run build` and `npm run test`.
