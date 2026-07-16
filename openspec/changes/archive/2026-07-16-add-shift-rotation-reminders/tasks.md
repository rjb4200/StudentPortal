## 1. Rotation Foundation

- [x] 1.1 Add a shared, pure America/New_York rotation helper anchored at 0700 on July 16, 2026 that returns the First/Second/Third Shift label, Chief name, and presentation token.
- [x] 1.2 Add unit tests for the anchor date, each rotation day, three-day repetition, and full 0700-to-0700 ride-date assignment.

## 2. Reminder Delivery Storage

- [x] 2.1 Create a numbered Supabase migration for a reminder-delivery ledger keyed uniquely by schedule and reminder type, with timestamps, delivery outcome details, indexes, and RLS suitable for server-side job writes and admin operational visibility.
- [x] 2.2 Apply the migration to the live Supabase project and regenerate `src/lib/supabase/database.types.ts`.
- [x] 2.3 Add tested server-side helpers that claim a reminder before delivery and prevent duplicate claims for the same scheduled ride.

## 3. Calendar And Admin Context

- [x] 3.1 Render a compact, accessible crew-shift tag in every student dashboard calendar cell without replacing existing schedule status styling or labels.
- [x] 3.2 Render the applicable crew-shift tag beside the date and time of each pending schedule request in Admin Daily Operations while preserving the existing actions.
- [x] 3.3 Verify responsive calendar cells and admin request rows retain readable date, time, crew, Chief, and status information on mobile and desktop widths.

## 4. Station 1 Email Guidance

- [x] 4.1 Add a server-side resolver for the active Station 1 map document URL using the existing resource-category and resource-document data.
- [x] 4.2 Update the student account-approval email to include general Station 1 reporting-at-0700 guidance and the active map link when available, without blocking approval if email or map lookup fails.
- [x] 4.3 Add or update email-template and approval-route tests for reporting guidance, map-link handling, HTML escaping, and best-effort delivery behavior.

## 5. Day-Before Reminder Job

- [x] 5.1 Add a protected reminder API route that selects only approved rides for tomorrow in America/New_York, derives the crew and Chief, resolves the Station 1 map, claims reminder delivery, and sends branded emails.
- [x] 5.2 Record reminder-job success and failure telemetry with eligible, claimed, delivered, skipped-duplicate, and failed counts without changing expiration-sweep telemetry.
- [x] 5.3 Add the daily 1800 UTC Vercel cron entry for the reminder route while preserving the existing expiration sweep schedule.
- [x] 5.4 Add route or helper tests for Eastern-date eligibility, approved-only filtering, duplicate suppression, map unavailability, and partial email-delivery failures.

## 6. Verification

- [x] 6.1 Confirm the active Station 1 resource document resolves to the intended public map URL in the live project.
- [x] 6.2 Run `npm run test`.
- [x] 6.3 Run `npm run build`.
- [ ] 6.4 Perform a controlled reminder-job verification using an approved test ride and confirm one email delivery and one reminder-ledger record.
