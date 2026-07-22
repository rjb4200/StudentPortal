## Why

The recent `add-calendar-link-controls` change introduced token-based calendar feeds with rotate, revoke, and email controls in the admin panel — but only for links the admin panel itself generates. The student dashboard and the aggregate calendar link on the maintenance page still use the legacy raw-UUID URLs (`/api/calendar/{studentId}.ics` and `/api/calendar/all.ics`), which bypass the token system entirely. Students continue to receive and use permanent, non-revocable links, rendering the rotate/revoke controls moot for their actual users. Every calendar link exposed to students, TEIs, and admins must flow through the managed token system.

## What Changes

- **Auto-generate tokens at student approval**: When `approve-student` creates the Supabase Auth user, also insert a `calendar_feeds` row with a fresh token (if one doesn't already exist)
- **Point the student dashboard at the token URL**: `getCalendarFeedUrl` and the dashboard UI use the token from `calendar_feeds` instead of the raw student UUID
- **Point the aggregate maintenance link at the token URL**: The "Aggregate iCal Feed" section in the maintenance tab uses the admin aggregate token from `calendar_feeds`
- **Include student calendar link in shift emails**: All shift-related emails (`buildShiftApprovedEmail`, `buildShiftRejectedEmail`, `buildShiftCancelledByAdminEmail`, `buildShiftCancelledByStudentEmail`, `buildShiftReminderEmail`) include the student's personal calendar feed URL from `calendar_feeds`
- **Include TEI calendar link in instructor class approval email**: `buildInstructorClassApprovedEmail` includes the training site's TEI calendar feed URL
- **Backfill existing certified students**: A one-time SQL script (applied via Supabase dashboard) that inserts `calendar_feeds` rows for all certified students who don't have one yet
- **Keep the legacy fallback path**: The existing `[studentId]` route fallback continues working so any external subscriptions to old URLs don't break
- **Send test emails**: Each modified email template is tested by sending to `rbrown@winchesterky.com`

## Capabilities

### Modified Capabilities
- `calendar-link-management`: Student dashboard, shift emails, and aggregate feed links now use the managed token system instead of raw student UUIDs / hardcoded URLs. TEI calendar links are included in instructor class approval emails. Tokens are auto-generated at student approval. Existing certified students are backfilled.
- `scheduling-calendar`: The student dashboard calendar feed section references the token-based URL from `calendar_feeds` instead of constructing a raw studentId URL. Shift notification emails include the student's personal calendar subscription link.
- `student-email-notifications`: Five shift email templates and the instructor class approval template gain calendar feed URLs in their content.

## Impact

- **DB**: `calendar_feeds` backfill for existing certified students
- **API**: `approve-student` route gains token auto-generation step; `registry-status` route fetches TEI token for instructor email; `schedule-action`, `schedule/cancel`, and `cron/shift-reminders` routes fetch student token for shift emails
- **UI**: `src/app/dashboard/page.tsx` — calendar feed URL construction; `src/components/admin/maintenance-archive.tsx` — aggregate feed URL
- **Email**: `src/lib/email-templates.ts` — 6 templates updated with calendar feed URLs (`buildInstructorClassApprovedEmail`, `buildShiftApprovedEmail`, `buildShiftRejectedEmail`, `buildShiftCancelledByAdminEmail`, `buildShiftCancelledByStudentEmail`, `buildShiftReminderEmail`)
- **Lib**: `src/lib/calendar-feed.ts` — new helper for resolving token URLs server-side
