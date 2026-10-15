## 1. Database

- [x] 1.1 Add a migration creating the `preceptor_shift` enum (`first`, `second`, `third`) and adding a nullable `shift` column to `preceptors`
- [x] 1.2 Add a nullable `preceptor_id` FK column to `schedules` referencing `preceptors(id)`
- [x] 1.3 Add a partial unique index on `schedules(preceptor_id, date)` where `preceptor_id is not null` to enforce one student per preceptor per day
- [x] 1.4 Apply the migration live and update `src/lib/supabase/database.types.ts`

## 2. Rotation and pool helpers

- [x] 2.1 Extend `src/lib/shift-rotation.ts` with a date→shift-key helper and a label→enum mapping so the pool is derived from one source
- [x] 2.2 Add a pool helper that, given a date and a list of preceptors, returns the active preceptors on that date's shift (chiefs excluded, inactive excluded)
- [x] 2.3 Unit-test the shift-key mapping and the pool derivation (including inactive and unassigned exclusion)

## 3. API

- [x] 3.1 Add an admin endpoint to assign/reassign a preceptor's shift (admin-gated, validated)
- [x] 3.2 Extend `POST /api/admin/schedule-action` to accept an optional `preceptorId` on approval; validate it is in the date's pool and not already paired that day
- [x] 3.3 Compute and return the capacity warning when approved students on a date would exceed the date's pool size (soft, non-blocking)
- [x] 3.4 Ensure the admin calendar data source exposes what is needed for per-day preceptor counts (or document the client-side derivation)
- [x] 3.5 Resolve the assigned preceptor's name and pass it to the approval email template

## 4. Admin UI

- [x] 4.1 Add a Preceptor Rotation manager where an admin adds preceptors by name to a shift and sees each shift's staff
- [x] 4.2 Add a preceptor selector to the Daily Ops Action Required approval, limited to the date's available pool, with a blank option
- [x] 4.3 Display the capacity warning on approval when students exceed available preceptors, allowing the admin to proceed
- [x] 4.4 Show the per-day preceptor count on the admin scheduling calendar
- [x] 4.5 Add the rotation-based coverage disclaimer to the admin scheduling calendar

## 5. Student UI

- [x] 5.1 Show the day's working preceptors in the shift request modal when a student selects a date
- [x] 5.2 Show the assigned preceptor on the day detail for the student's shift when one is assigned

## 6. Email

- [x] 6.1 Add an optional `preceptor_name` to `buildShiftApprovedEmail` and render it only when present
- [x] 6.2 Update or add a test asserting the approval email includes the preceptor when assigned and omits it otherwise

## 7. Verification

- [x] 7.1 Add API tests for preceptor shift assignment, pairing validation, one-per-day rejection, and the capacity warning
- [x] 7.2 Run `npm run test` and `npm run build`
- [ ] 7.3 Manually verify: assign preceptors to shifts; the calendar shows counts and the disclaimer; a student sees working preceptors when requesting; approval offers only the available pool; a second pairing is blocked; over-capacity warns; the approval email names the preceptor
- [ ] 7.4 Run `openspec validate preceptor-rotation --strict` and archive the change when complete
