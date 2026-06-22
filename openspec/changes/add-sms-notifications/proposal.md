## Why

Students currently receive schedule and account updates by email only, which can be missed before time-sensitive ride-along shifts. Adding SMS notifications gives students day-before reminders and gives staff an optional faster alert channel for operational events while preserving server-side control of Twilio credentials and delivery logs.

## What Changes

- Add server-side SMS notification support using Twilio for opted-in recipients.
- Add a queue/log model for SMS notifications so delivery attempts, provider IDs, failures, and retries are auditable.
- Send or enqueue an SMS confirmation when an admin approves a student shift request.
- Queue day-before SMS reminders for approved student shifts and process them from a protected daily job.
- Add student SMS consent fields and admin SMS contact/preference fields.
- Add global SMS settings for enabling student approval texts, day-before reminders, admin alerts, and reminder send time.
- Keep SMS content free of sensitive clinical/private details and identify messages as WFD EMS Student Portal messages.
- Defer editable SMS templates and broad admin alert coverage unless needed for the initial implementation.

## Capabilities

### New Capabilities

- `sms-notifications`: Queue, send, log, and retry server-side SMS notifications through Twilio for opted-in students and admins.

### Modified Capabilities

- `student-email-notifications`: Schedule approval behavior expands from best-effort email only to best-effort email plus SMS queueing for opted-in students when SMS is enabled.
- `data-management`: The database model adds SMS consent/contact fields, notification queue/log records, and SMS-related portal settings.
- `admin-account-management`: Admin accounts gain SMS contact fields and SMS alert preferences alongside existing email notification preferences.
- `notifications-alerts`: Transactional notification behavior expands to include SMS delivery handling and daily reminder processing.

## Impact

- Database: add SMS consent fields, admin SMS fields/preferences, notification queue/log table, indexes, RLS policies, and portal setting seeds.
- Server routes/utilities: add server-only Twilio sender and queue processor; update schedule approval flow to enqueue SMS work.
- Cron: add or extend a protected daily job for due SMS notifications and day-before reminders using `CRON_SECRET` authorization.
- Admin UI: expose SMS consent/preference fields and provide visibility into failed or recent SMS delivery attempts.
- Environment: add server-only `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` variables.
- Dependencies: add Twilio API integration, preferably through direct server-side HTTP or a pinned Twilio package.
- Security/compliance: normalize/validate phone numbers, require opt-in before sending, keep Twilio secrets server-only, and avoid sensitive details in SMS body text.
