## 1. RLS Policy

- [x] 1.1 Add RLS policy on `calendar_feeds` allowing students to SELECT their own row where `feed_type = 'student'` and `entity_id = auth.uid()`

## 2. Auto-generate Token on Student Approval

- [x] 2.1 Modify `src/lib/auth.ts` `approveStudent()` to insert a `calendar_feeds` row with `feed_type = 'student'` and `entity_id = <student's auth_user_id>` after successful auth user creation, using `INSERT ... ON CONFLICT DO NOTHING` for idempotency

## 3. Student Dashboard Token URL

- [x] 3.1 Update `src/app/dashboard/page.tsx` to query `calendar_feeds` for the authenticated student's token and use it in `getCalendarFeedUrl()` instead of the raw student UUID
- [x] 3.2 Fall back to legacy `studentId`-based URL when no `calendar_feeds` row exists for the student

## 4. Maintenance Page Aggregate Token URL

- [x] 4.1 Update `src/components/admin/maintenance-archive.tsx` to query `calendar_feeds` for the aggregate row's token and display that URL instead of the hardcoded `/api/calendar/all.ics`
- [x] 4.2 Fall back to the legacy `/api/calendar/all.ics` URL when no aggregate row or token exists

## 5. Shift Emails Include Student Calendar Link

- [x] 5.1 Add server-side `resolveCalendarFeedUrl` helper to `src/lib/calendar-feed.ts` that looks up or auto-generates a token for a given `(feed_type, entity_id)` and returns the full feed URL
- [x] 5.2 Update `buildShiftApprovedEmail` to include `feedUrl` parameter and render it in the email body
- [x] 5.3 Update `buildShiftRejectedEmail` to include `feedUrl` parameter and render it in the email body
- [x] 5.4 Update `buildShiftCancelledByAdminEmail` to include `feedUrl` parameter and render it in the email body
- [x] 5.5 Update `buildShiftCancelledByStudentEmail` to include `feedUrl` parameter and render it in the email body
- [x] 5.6 Update `buildShiftReminderEmail` to include `feedUrl` parameter and render it in the email body
- [x] 5.7 Update `src/app/api/admin/schedule-action/route.ts` to resolve the student's feed URL and pass it to the email templates
- [x] 5.8 Update `src/app/api/schedule/cancel/route.ts` to resolve the student's feed URL and pass it to the email template
- [x] 5.9 Update `src/app/api/cron/shift-reminders/route.ts` to resolve each student's feed URL and pass it to the email template

## 6. Instructor Class Approval Email Includes TEI Calendar Link

- [x] 6.1 Update `buildInstructorClassApprovedEmail` to include `feedUrl` parameter and render it in the email body with subscribe instructions
- [x] 6.2 Update `src/app/api/admin/registry-status/route.ts` to resolve the training site's TEI feed URL and pass it to the email template

## 7. Student Dashboard Token URL

- [x] 7.1 Update `src/app/dashboard/page.tsx` to query `calendar_feeds` for the authenticated student's token and use it in `getCalendarFeedUrl()` instead of the raw student UUID
- [x] 7.2 Fall back to legacy `studentId`-based URL when no `calendar_feeds` row exists for the student

## 8. Maintenance Page Aggregate Token URL

- [x] 8.1 Update `src/components/admin/maintenance-archive.tsx` to query `calendar_feeds` for the aggregate row's token and display that URL instead of the hardcoded `/api/calendar/all.ics`
- [x] 8.2 Fall back to the legacy `/api/calendar/all.ics` URL when no aggregate row or token exists

## 9. Backfill Script

- [x] 9.1 Write and apply backfill SQL: insert `calendar_feeds` rows for all certified students without one, plus the aggregate row if missing
- [x] 9.2 Save backfill SQL to `supabase/migrations/` for documentation

## 10. Test Emails

- [x] 10.1 Send test instructor class approval email to `rbrown@winchesterky.com` with TEI calendar link
- [x] 10.2 Send test shift approval email to `rbrown@winchesterky.com` with student calendar link
- [x] 10.3 Send test shift rejection email to `rbrown@winchesterky.com` with student calendar link
- [x] 10.4 Send test admin shift cancellation email to `rbrown@winchesterky.com` with student calendar link
- [x] 10.5 Send test student self-cancellation email to `rbrown@winchesterky.com` with student calendar link
- [x] 10.6 Send test shift reminder email to `rbrown@winchesterky.com` with student calendar link

## 11. Build and Verify

- [x] 11.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 11.2 Verify new student approval auto-generates a token and appears in admin panel
- [x] 11.3 Verify existing certified student (backfilled) shows token URL in dashboard
- [x] 11.4 Verify maintenance page shows aggregate token URL after backfill
- [x] 11.5 Verify legacy studentId URLs still serve feeds (existing subscriptions not broken)
