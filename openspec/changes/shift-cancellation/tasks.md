## 1. Database migration

- [x] 1.1 Create migration `supabase/migrations/009_shift_cancellation.sql` — add `'cancelled'` to `schedule_status` enum, add `cancel_note text` to `schedules`, add RLS policy for student UPDATE to `'cancelled'`
- [x] 1.2 Apply migration to live Supabase project

## 2. TypeScript types

- [x] 2.1 Add `'cancelled'` to `schedule_status` enum and `cancel_note` to schedules Row/Insert/Update in `database.types.ts`

## 3. Student cancel API route

- [x] 3.1 Create `src/app/api/schedule/cancel/route.ts` — POST handler authenticates student via session, verifies schedule ownership, updates status to `'cancelled'` with optional `note` from request body, sends student cancellation email + admin notification email (both include note when present)

## 4. Student cancel modal

- [x] 4.1 Create `src/components/dashboard/cancel-shift-modal.tsx` — shows date, time range, current status, and "Cancel Shift" button; for approved shifts, a required note textarea before the cancel button is enabled
- [x] 4.2 Update `handleDateClick` in `src/app/dashboard/page.tsx` to open cancel modal instead of silently ignoring when shift exists on clicked date

## 5. Calendar grid

- [x] 5.1 Add `'cancelled'` styling to calendar cells in `calendar-grid.tsx` — orange/amber background distinct from rejected gray

## 6. Admin daily-ops panel

- [x] 6.1 Show approved schedules alongside pending in the Action Required card
- [x] 6.2 Add "Cancel" button for pending and approved shifts
- [x] 6.3 Add optional note text input before confirming cancel, with hint that student will see the note

## 7. Admin schedule-action route

- [x] 7.1 Add `'cancelled'` to accepted actions in `schedule-action/route.ts`
- [x] 7.2 Accept optional `note` field, store it in `cancel_note`
- [x] 7.3 Remove the "must be pending" guard (allow cancelling approved shifts too)
- [x] 7.4 Send WFD-branded cancellation email to student with note when present

## 8. Verification

- [x] 8.1 Run `npm run build` and confirm zero errors
