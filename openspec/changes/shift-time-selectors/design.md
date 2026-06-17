## Context

The `schedules` table stores only `shift_type` (enum: `full`, `day`, `night`) with no time columns. The shift modal shows hardcoded time descriptions that never reach the database. Emails, the admin panel, calendar cells, and iCal feeds all display the raw enum string. Students need actual start/end times in 12-hour format, admins in 24-hour.

## Goals / Non-Goals

**Goals:**
- Add `start_time` and `end_time` text columns to `schedules` and populate them at insert time
- Provide Day/Full presets (locked) and a Custom option with start/end dropdowns
- Default custom start to 0700, show nag text when changed, bold 07:00 in dropdown
- Display times in 12-hour AM/PM on student-facing surfaces, 24-hour on admin surfaces
- Remove Night from student UI (keep in DB enum for existing data)
- Add `'custom'` to the `shift_type` enum

**Non-Goals:**
- Converting existing `night` records — they stay as-is
- Adding time validation (end must be after start) — rely on student selection
- Changing the iCal date format (stays date-only, time is in description only)
- Adding a shift time configuration table for admins

## Decisions

### Decision 1: Store times as text, not `time` type

Use `text` for `start_time` and `end_time` rather than PostgreSQL `time` type.

**Why**: The display format differs by audience (12-hour vs 24-hour). Storing as text avoids format conversion at query time and keeps the stored value as the human-readable format. The shift signup modal inserts 12-hour values (e.g., `'7:00 AM'`). Admin surfaces convert to 24-hour for display (e.g., `'0700'`).

**Alternatives considered**: PostgreSQL `time` type would require `to_char()` formatting in queries. Storing as a canonical format (e.g., `'07:00:00'`) and formatting per audience would be cleaner but requires format helpers in every display layer.

### Decision 2: Time values stored in 12-hour format

The database stores times as 12-hour strings (`'7:00 AM'`, `'7:00 PM'`).

**Why**: The student-facing UI works natively with 12-hour strings. Admin surfaces do a simple lookup/conversion (e.g., `'7:00 AM'` → `'0700'`, `'7:00 PM'` → `'1900'`) via a small mapping function. This keeps the insert path simple and avoids dual-format storage.

**Conversion table:**
```
'7:00 AM'  → '0700'
'7:00 PM'  → '1900'
'8:00 AM'  → '0800'
...etc
```

### Decision 3: Custom shift with preset dropdown values

Custom start/end dropdowns offer hourly increments from 7:00 AM to 11:00 PM:

```
Start:  7:00 AM, 8:00 AM, 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM,
        1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM,
        7:00 PM, 8:00 PM, 9:00 PM, 10:00 PM, 11:00 PM

End:    same values
```

**Why**: Covers all realistic shift start/end times. Limits to hourly increments to keep the dropdown manageable. The 07:00 option gets bold styling via a CSS class conditional on value.

### Decision 4: Nag text logic

The nag text appears below the start dropdown when `selectedStartTime !== '7:00 AM'`:

```
⚠ The shift starts at 0700. The best student experience would be to arrive at that time.
```

**Why**: Gentle reminder. Not a blocker — student can still submit. This is purely informational UI, not validation.

### Decision 5: Night shift removal

Hide the Night option from the shift modal's radio list. Keep `'night'` in the PostgreSQL enum so existing rows don't break. No data migration needed.

**Why**: The user confirmed night shifts are no longer needed for new signups. Removing from the enum entirely would require migrating existing data; keeping the value but hiding the UI option is the least-risk approach.

## Risks / Trade-offs

- **[Risk] Existing `night` schedule rows have no times** → These rows have `NULL` for `start_time`/`end_time`. Calendar and email rendering must handle null gracefully (fall back to showing just the date or "Night" text).
- **[Trade-off] Text storage lacks type safety** → `start_time = 'foo'` is technically valid. Mitigation: The dropdown UI constrains input to preset values. No free-form text entry.
