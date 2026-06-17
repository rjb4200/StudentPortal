## 1. Database migration

- [x] 1.1 Create migration `supabase/migrations/008_shift_time_selectors.sql` adding `start_time text` and `end_time text` to `schedules`, adding `'custom'` to `shift_type` enum
- [x] 1.2 Apply migration to live Supabase project

## 2. TypeScript types

- [x] 2.1 Run `supabase_generate_typescript_types` and replace `src/lib/supabase/database.types.ts`
- [x] 2.2 Add a `TIME_FORMATS` constant mapping 12-hour strings to 24-hour (e.g., `'7:00 AM' → '0700'`, `'7:00 PM' → '1900'`) in a shared location

## 3. Shift signup modal

- [x] 3.1 Rework `ShiftModal` — remove Night, add Day/Full as locked presets with time labels, add Custom with start/end `<select>` dropdowns
- [x] 3.2 Style 07:00 bold in the Custom start dropdown
- [x] 3.3 Add nag text below Custom start when selected value ≠ "7:00 AM"
- [x] 3.4 Update `onSubmit` to pass start_time and end_time alongside shift_type

## 4. Dashboard calendar

- [x] 4.1 Update `handleShiftSubmit` in `src/app/dashboard/page.tsx` to include `start_time` and `end_time` in the schedule insert
- [x] 4.2 Update `CalendarGrid` to display abbreviated 12-hour time below the date for each schedule cell (e.g., "7A–7P")

## 5. Admin daily-ops panel

- [x] 5.1 Update schedule request display in `daily-ops.tsx` to show time range in 24-hour format alongside date

## 6. Schedule email

- [x] 6.1 Update `src/app/api/admin/schedule-action/route.ts` to display start_time–end_time in 12-hour AM/PM format instead of raw shift_type in email body

## 7. iCal feeds

- [x] 7.1 Update `src/lib/ical.ts` to include time range in event summary when available
- [x] 7.2 Update calendar API routes to select `start_time` and `end_time`

## 8. Verification

- [x] 8.1 Run `npm run build` and confirm zero errors
