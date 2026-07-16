## Why

Students and staff cannot currently see the department's repeating 24/48 crew rotation alongside scheduled rides. Students also need clear Station 1 reporting guidance when approved and before a ride, while reminder delivery must avoid duplicate emails when scheduled jobs retry.

## What Changes

- Add a shared First/Second/Third Shift rotation calculation anchored to July 16, 2026 at 0700 America/New_York: R Brown (orange), S Bellot (yellow), and M Martin (gray).
- Show the applicable crew-shift tag in every student dashboard calendar cell and beside pending schedule requests in Admin Daily Operations.
- Add general Station 1 reporting instructions and an active Station 1 map link to the student account-approval email.
- Add a daily 1800 UTC reminder job that notifies students with approved rides on the following America/New_York calendar day, including their ride time, crew shift, on-duty Chief, Station 1 reporting instruction, and map link.
- Persist reminder deliveries so retrying or manually invoking the job does not send a duplicate reminder for the same scheduled ride.

## Capabilities

### New Capabilities
- `shift-rotation`: Determine and present the repeating 0700-to-0700 department crew shift for calendar dates and scheduled rides.
- `shift-reminders`: Deliver one day-before reminder email per approved ride with durable duplicate prevention.

### Modified Capabilities
- `scheduling-calendar`: Student calendar cells display the applicable department crew-shift tag in addition to the student's schedule state.
- `admin-command-center`: Pending schedule requests display the applicable department crew-shift tag before an admin approves or rejects them.
- `student-email-notifications`: Student account-approval emails include general Station 1 reporting guidance and a map link.

## Impact

- Affected code: dashboard calendar, Admin Daily Operations schedule queue, student email templates, cron routes/configuration, and shared date/rotation helpers.
- Data model: a new reminder-delivery record with RLS for server-side insertion and admin visibility as appropriate.
- External systems: Vercel daily cron and Resend transactional email delivery.
- Dependencies: no new package dependency expected.
- Verification: unit tests for rotation and reminder eligibility/deduplication, `npm run build`, and `npm run test`.
