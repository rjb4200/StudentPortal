## 1. Schema And Environment

- [x] 1.1 Reconcile live Supabase schema against local migrations for `admin_accounts`, `preceptors`, `students`, and notification-related tables before writing SMS DDL.
- [x] 1.2 Create a Supabase migration for student SMS fields, admin SMS fields/preferences, global SMS settings, and the SMS notification queue/log table.
- [x] 1.3 Add RLS policies and supporting indexes for SMS queue/log access, due-job lookup, recipient lookup, and idempotent shift reminder queueing.
- [x] 1.4 Apply the migration to the live Supabase project and document any schema drift discovered during application.
- [x] 1.5 Regenerate `src/lib/supabase/database.types.ts` after the live DDL change.
- [x] 1.6 Add server-only Twilio environment variables to env validation and deployment documentation without exposing them through `NEXT_PUBLIC_*` variables.

## 2. SMS Delivery Core

- [x] 2.1 Add a server-only SMS utility that validates/normalizes phone numbers and sends messages through Twilio.
- [x] 2.2 Add notification queue helpers for enqueueing SMS rows, cancelling pending rows, and marking rows sent or failed.
- [x] 2.3 Add retry/attempt handling with `attempt_count`, `last_attempt_at`, provider message id, and error message updates.
- [x] 2.4 Add unit tests for phone validation, queue helper behavior, successful send logging, failed send logging, and missing Twilio configuration.

## 3. Schedule SMS Events

- [x] 3.1 Update the admin schedule approval flow to enqueue a shift approval SMS for opted-in students when the global setting is enabled.
- [x] 3.2 Queue a day-before shift reminder SMS when an opted-in student's shift is approved and reminders are enabled.
- [x] 3.3 Cancel or skip pending reminder SMS rows when a shift is cancelled or rejected before the reminder is sent.
- [x] 3.4 Ensure schedule updates still succeed when SMS queueing or delivery fails, with failures logged server-side.
- [x] 3.5 Add tests for approval SMS queueing, no queueing without opt-in, reminder queueing, and reminder cancellation/skipping.

## 4. SMS Processing Job

- [x] 4.1 Add a protected server-side route or extend the existing cron route to process due SMS notification rows using `CRON_SECRET` authorization.
- [x] 4.2 Add Vercel cron configuration for the SMS processor if using a dedicated endpoint.
- [x] 4.3 Implement due-record claiming so overlapping job runs do not send duplicate SMS messages.
- [x] 4.4 Ensure due reminders are sent only for schedules that are still approved.
- [x] 4.5 Add route tests for authorized processing, unauthorized rejection, successful sends, failed sends, and cancelled/skipped reminders.

## 5. Admin SMS Alerts And UI

- [x] 5.1 Add admin account UI fields for phone, SMS opt-in, SMS verified, and SMS alert category preferences.
- [x] 5.2 Add student account UI fields for SMS opt-in and SMS verified alongside existing phone editing.
- [x] 5.3 Add global SMS settings controls for approval SMS, day-before reminders, admin SMS alerts, and reminder send time.
- [x] 5.4 Enqueue optional admin SMS alerts for onboarding completion and flagged evaluations when global and per-admin SMS settings allow it.
- [x] 5.5 Add admin visibility for recent or failed SMS notification rows with recipient, type, status, error, and attempt metadata.

## 6. Verification

- [x] 6.1 Run `npm run test` and fix any failures introduced by SMS changes.
- [x] 6.2 Run `npm run build` and fix any type or Next.js build failures.
- [x] 6.3 Run Supabase advisors after DDL and surface any new security or performance warnings.
- [ ] 6.4 Manually verify one test approval SMS path with Twilio test credentials or a controlled recipient before enabling production SMS settings.
- [x] 6.5 Verify Twilio credentials are absent from client bundles, browser-visible environment variables, logs, and API responses.
