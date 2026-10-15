## Why

Preceptors currently exist only as profiles — nothing places them on a day. The Training Major cannot see who, or how many, preceptors are on duty, cannot pair a student with a preceptor at approval, and cannot avoid approving more students than there are preceptors to supervise them. Students have no way to know who they will ride with. This adds a preceptor rotation and shift pairing so the Major can staff each day and control student sign-ups against available coverage.

## What Changes

- Add a preceptor **shift assignment** (First / Second / Third) so the Major can add preceptors by name and place them on a shift.
- Derive a **daily preceptor pool** from the existing 24/48 crew rotation — active preceptors on the day's shift (chiefs excluded from the count).
- Show a **per-day preceptor count** on the admin Calendar, with a disclaimer that coverage is based on the 24/48 rotation, not the schedule, and does not reflect comp, vacation, sick, or traded days.
- Let the Major **optionally assign one preceptor** to each approved student shift, chosen from that day's available pool; leaving it blank is allowed.
- Enforce **one student per preceptor per day** and **warn** (soft, allow) when approved students on a day exceed the available preceptors.
- Let students **see who is working** on a date they request and the **assigned preceptor** on the day detail.
- Include the assigned preceptor's name in the **shift approval email** when one is assigned.

## Capabilities

### New Capabilities

- `preceptor-rotation`: assign preceptors to shifts, derive the daily pool from the 24/48 rotation, pair one preceptor to a student at approval with a one-per-day capacity rule, show per-day coverage on the admin calendar, and expose working preceptors to students.

### Modified Capabilities

- `scheduling-calendar`: the admin approval workflow gains optional per-student preceptor assignment with a capacity warning.
- `student-email-notifications`: the schedule approved email includes the assigned preceptor's name when present.

## Impact

- **Database** — `preceptors.shift` (enum: `first | second | third`); `schedules.preceptor_id` (nullable FK to `preceptors`) with a unique `(preceptor_id, date)` constraint (where not null) enforcing one student per preceptor per day.
- **API** — schedule approval accepts an optional `preceptorId`, enforces the one-per-day rule, and returns/streams the capacity warning; a new admin endpoint assigns preceptors to shifts; the admin calendar data source exposes per-day preceptor counts (or derives them client-side).
- **UI** — a Preceptor Rotation manager (assign by name to a shift); Daily Ops Action Required approval gains a preceptor selector, the day's available list, and a capacity warning; the admin Calendar shows the per-day preceptor count plus disclaimer; the student dashboard shows the day's working preceptors when requesting and the assigned preceptor on the day detail.
- **Email** — `buildShiftApprovedEmail` gains an optional preceptor name.
- **Non-goals** — no reassign/swap workflow; no modeling of sick, trade, or vacation days; no backfill of existing approved shifts (they stay blank).
