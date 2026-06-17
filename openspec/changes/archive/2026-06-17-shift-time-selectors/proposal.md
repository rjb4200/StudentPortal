## Why

Shift types ("day", "night", "full") are stored as raw enum values with no times attached. Emails, the admin panel, calendar cells, and iCal feeds all display the cryptic enum string — "full", "day", "night" — which means nothing to students and staff. The signup modal shows hardcoded time descriptions but never stores them. Students need to know and see actual start/end times in 12-hour format (AM/PM), while admins need 24-hour format.

## What Changes

- **Database migration**: Add `start_time text` and `end_time text` columns to the `schedules` table. Add `'custom'` to the `shift_type` enum.
- **Shift signup modal**: Replace static time descriptions with a new UI — Day and Full remain locked presets (7:00 AM – 7:00 PM / 7:00 AM – 7:00 AM next day). Add a Custom option with start/end dropdowns defaulting to 0700. Show nag text when custom start ≠ 0700 reminding the student that 0700 is the recommended arrival. **07:00 is bold** in the dropdown. Night removed from UI (kept in DB enum).
- **Student-facing surfaces** display times in 12-hour AM/PM format. **Admin-facing surfaces** display times in 24-hour format.
- **Schedule email**: Show the actual time range instead of raw `shift_type`.
- **Admin daily-ops panel**: Show time range in 24-hour format alongside date.
- **Calendar grid cells**: Show abbreviated time below the date.
- **iCal feeds**: Use actual times in the event summary/description.
- **Regenerate database types** after the migration is applied.

## Capabilities

### New Capabilities

- `shift-time-selectors`: Student selects actual start/end times when signing up for a shift via dropdowns in the signup modal. Times flow through to emails, admin panel, calendar, and iCal — with 12-hour AM/PM for students and 24-hour for admins.

### Modified Capabilities

- `scheduling-calendar`: Calendar grid cells now display time ranges. The schedule insert includes `start_time` and `end_time`. iCal feeds use actual times in event descriptions.

## Impact

- **New migration**: `supabase/migrations/008_shift_time_selectors.sql` — adds columns, extends enum
- **Modified**: shift-modal, dashboard page, admin daily-ops, schedule-action email route, calendar routes, iCal generator, calendar-grid
- **Database types**: Regenerate after migration applied
- **No new dependencies**
