## Context

StudentPortal already sends best-effort transactional email for schedule approvals, cancellations, onboarding completion, and flagged evaluations. The app also has a protected daily Vercel cron route at `/api/cron/sweep`, student phone numbers, admin/preceptor notification preferences, and generated Supabase types that include live account-management tables.

Issue #81 asks for SMS notifications through Twilio for students and admins. The feature crosses database schema, server-only provider integration, cron processing, admin configuration, and notification delivery logging. The current codebase also has local migration drift relative to live/generated schema, so implementation must reconcile schema state before applying SMS migrations.

## Goals / Non-Goals

**Goals:**

- Send SMS confirmations to opted-in students when a shift is approved.
- Send day-before SMS reminders to opted-in students for approved shifts.
- Add optional admin SMS alert preferences for operational notifications.
- Keep Twilio credentials server-only and never expose them through `NEXT_PUBLIC_*` variables or browser code.
- Record SMS delivery attempts, provider message IDs, status, error messages, and retry metadata.
- Process SMS work from a protected low-frequency job compatible with the current Vercel cron setup.
- Add enough admin visibility to troubleshoot failed SMS sends.

**Non-Goals:**

- Implement two-way SMS conversations or inbound Twilio webhooks.
- Send protected medical, clinical, or sensitive private details by SMS.
- Replace existing email notifications.
- Build a full template editor in the first release.
- Build verification-code SMS enrollment unless explicitly chosen before implementation.
- Add instructor SMS delivery in the MVP beyond reserving the recipient type for future use.

## Decisions

### Queue-first delivery model

Use a `notification_queue` table as both work queue and delivery log instead of sending Twilio messages directly from every event route.

Rationale: shift reminders are naturally scheduled work, failed delivery must be visible, and future admin alerts should reuse one delivery path. Direct sends would be simpler for approval confirmations, but would duplicate logging/retry behavior and still need a separate reminder scheduler.

The schedule approval route may enqueue the immediate approval SMS and then either leave it for the cron processor or invoke a shared processor for due records after the schedule update. The durable queue remains the source of truth either way.

### One SMS table for initial delivery state

Use one table with fields for `recipient_type`, `recipient_id`, `phone_number`, `notification_type`, `channel`, `message_body`, `send_at`, `sent_at`, `status`, `provider`, `provider_message_id`, `error_message`, `attempt_count`, `last_attempt_at`, `created_at`, and `updated_at`.

Rationale: expected volume is only 300-500 SMS/month, so a separate job table plus log table is unnecessary for the MVP. A single auditable row per notification keeps admin troubleshooting simple.

### Server-only Twilio integration

Create a server-only SMS utility using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` from server environment variables. Prefer direct HTTP to Twilio's Messages API or a pinned Twilio package added to `package-lock.json`.

Rationale: Twilio credentials are secrets and must not enter client bundles. A small server utility mirrors the existing `sendEmail` pattern and keeps provider behavior isolated.

### Explicit opt-in gate

Require `sms_opt_in = true`, a non-empty normalized phone number, and SMS feature settings before enqueueing SMS. `sms_verified` is included in the data model, but the MVP can treat it as an admin/staff-confirmed field unless a verification-code flow is selected before implementation.

Rationale: SMS compliance requires consent and a disable path. Full phone verification is valuable but adds user flows and Twilio costs that are not required to prove the notification engine.

### Settings via existing configuration patterns

Use existing `portal_settings` for global SMS toggles and reminder send time unless implementation discovers that strongly typed settings are needed.

Rationale: the app already uses `portal_settings` for simple admin-configurable values. This avoids adding a new settings table for a small number of global SMS controls.

### Protected daily processing

Process due SMS queue records from a protected route using the same `Authorization: Bearer <CRON_SECRET>` pattern as `/api/cron/sweep`. The route can be a new `/api/cron/send-sms` endpoint with a second Vercel cron entry or an extension of the existing sweep route.

Rationale: the deployed app already depends on Vercel cron and `CRON_SECRET`. A dedicated endpoint is clearer operationally; folding into sweep is simpler for one cron slot.

### Reminder creation strategy

Queue the day-before reminder when a shift is approved, with `send_at` set to the configured reminder time on the day before the shift. Cancel queued reminders when the shift is cancelled or rejected.

Rationale: precomputing the reminder gives admins a visible future delivery row and avoids daily cron having to infer which reminders already exist.

## Risks / Trade-offs

- Duplicate SMS sends if cron overlaps or a route retries after partial failure -> Mitigate with status transitions (`pending` to `processing`), attempt timestamps, and idempotent queue constraints for schedule reminders.
- Local migrations do not fully reflect live schema -> Mitigate by inspecting live tables, generating a clean migration against the actual project, and regenerating Supabase types after DDL.
- Phone numbers may be invalid or non-US -> Mitigate with normalization to E.164 where possible and failed-send logging when validation rejects a number.
- SMS costs can grow unexpectedly -> Mitigate with feature toggles, opt-in requirements, and concise templates.
- Admin/staff-confirmed `sms_verified` is weaker than code verification -> Mitigate by clearly labeling MVP semantics and leaving room for a future verification-code flow.
- Queue rows can expose phone numbers and message content to admins -> Mitigate by restricting queue access to admins/service-role operations and keeping message bodies free of sensitive details.
- Twilio outages could delay reminders -> Mitigate with retry metadata and admin-visible failed status.

## Migration Plan

1. Reconcile live schema with local migrations before writing SMS DDL, especially `admin_accounts` and `preceptors` tables.
2. Add DDL for SMS fields, queue table, indexes, RLS policies, and settings seeds.
3. Apply the migration to the live Supabase project and regenerate `src/lib/supabase/database.types.ts`.
4. Add Twilio environment variables to local and Vercel server environments.
5. Deploy server-only SMS utility and queue processor without enabling SMS settings by default.
6. Enable student approval SMS and reminders after validating a test recipient.
7. Roll back operationally by disabling SMS settings; database rows can remain for audit history.

## Open Questions

- Should `sms_verified` require a student-entered verification code in the first implementation, or is admin/staff confirmation acceptable for MVP?
- Should a new `/api/cron/send-sms` route be added, or should SMS processing be folded into `/api/cron/sweep`?
- Should failed sends be shown in a dedicated admin page, or is a compact delivery log section under existing admin maintenance sufficient?
- Should admin SMS alerts be included in the first implementation after the student shift/reminder path works, or split into a follow-up change?
