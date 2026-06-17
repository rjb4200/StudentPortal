## Why

Students and admins have no way to cancel or delete a shift. A student who signed up for the wrong day is stuck. An admin who needs to remove a shift has no mechanism beyond bulk purging all data. The calendar grid silently ignores clicks on existing shift dates, offering no action.

## What Changes

- **Database**: Add `'cancelled'` to `schedule_status` enum. Add `cancel_note text` column to `schedules`. Add RLS policy allowing students to cancel their own schedules.
- **Student cancel flow**: Clicking a calendar date with an existing shift opens a cancel confirmation modal showing the shift details (date, time, status). Confirming calls a new `POST /api/schedule/cancel` route that updates the status to `'cancelled'` and sends a confirmation email to the student. A cancellation on a pending shift takes effect immediately — no admin approval needed. Cancelling also notifies admins via email.
- **Admin cancel flow**: The daily-ops panel now shows approved shifts alongside pending ones. A "Cancel" button opens an optional note input (with a hint that the student will see the note). Confirming calls `POST /api/admin/schedule-action` with `action: 'cancelled'` and the note, storing it in `cancel_note` and sending a WFD-branded cancellation email to the student including the note.
- **Calendar styling**: Cancelled cells get distinct orange styling, visually different from rejected (gray/strikethrough).

## Capabilities

### New Capabilities

- `shift-cancellation`: Students can cancel their own pending or approved shifts via the calendar. Admins can cancel any shift with an optional note that appears in the student's notification email. Both trigger WFD-branded cancellation emails.

### Modified Capabilities

- `scheduling-calendar`: Calendar cells now open a cancel modal when clicked on an existing shift. Cancelled cells get orange styling. The schedule lifecycle expands from 3 states to 4 (pending → approved/rejected/cancelled).
- `student-email-notifications`: New cancellation email template. Admin cancels include the optional note. Student self-cancels trigger admin notification emails.

## Impact

- **New migration**: `supabase/migrations/009_shift_cancellation.sql` — adds `'cancelled'` enum value, `cancel_note` column, student cancel RLS policy
- **New route**: `src/app/api/schedule/cancel/route.ts`
- **Modified**: schedule-action route, calendar-grid, dashboard page, daily-ops panel, new cancel modal component
- **Types**: Regenerate `database.types.ts`
