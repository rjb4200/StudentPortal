## Context

The 24/48 rotation already exists as a computed three-crew cycle (`getShiftRotation`) used to label days on the student calendar, in reminder emails, and in Daily Ops. Preceptors exist as profile rows (`preceptors`: name, bio, station, active, auth link) with evaluations, a student gallery, and analytics — but nothing connects a preceptor to a date. Student shifts live in `schedules(student_id, date, shift_type, status, …)` with request → approve/reject/cancel, reminders, and iCal. The feature bridges these: preceptors get a shift, the shift determines each day's pool, and the admin pairs a preceptor to a student at approval.

## Goals / Non-Goals

**Goals:**
- Assign preceptors (by name) to First/Second/Third shifts.
- Derive each day's preceptor pool from the rotation; exclude chiefs and inactive preceptors.
- Show per-day preceptor counts on the admin calendar with an honest disclaimer.
- Pair one preceptor to a student at approval; enforce one student per preceptor per day; softly warn on over-capacity.
- Show working preceptors to students when requesting and the assigned preceptor on the day detail.
- Name the assigned preceptor in the approval email when present.

**Non-Goals:**
- Reassign/swap workflow after approval.
- Modeling sick/trade/vacation/comp days (the calendar disclaimer acknowledges this).
- Backfilling existing approved shifts.
- Editing shift names, chiefs, colors, or the rotation anchor.
- A preceptor-facing schedule view.

## Decisions

**1. Shift is a fixed enum on `preceptors`, not a table.**
Add `preceptors.shift` as `first | second | third`. The three crews, their chiefs, colors, and anchor stay in `shift-rotation.ts`. A `shifts` table would only pay off if admins edit shift metadata, which is out of scope. Alternative rejected: a `crews` table (more churn, touches the calendar tag, reminder cron, and Daily Ops for no current benefit).

**2. Pool is derived, never stored.**
`pool(date)` = active `preceptors` whose `shift` equals the crew shift for `date`. Add a small helper that maps a date to its shift key (extending `shift-rotation.ts`) so the label→enum mapping lives in one place. Chiefs are not preceptors in this model and are never counted.

**3. Pairing lives on `schedules.preceptor_id`.**
A nullable FK on the existing schedule row, set at approval. This keeps one row per student-shift and avoids a new join table. Alternative rejected: a separate `shift_assignments` table (more joins for no additional expressiveness here).

**4. One student per preceptor per day is a hard database rule.**
A partial unique index on `(preceptor_id, date)` where `preceptor_id is not null` enforces it, backed by an API check that returns a clear error. The picker also filters already-paired preceptors.

**5. Capacity exceeds is a soft warning, not a block.**
Warn when approving would make the approved students on a date exceed that date's pool size. The API returns the warning alongside success; the UI shows it and allows proceeding. Alternative rejected: hard block (the admin must be able to over-staff deliberately).

**6. Students read the pool directly; the admin calendar count reuses it.**
`preceptors` are readable by authenticated users under existing RLS, so the student request/day-detail views compute the day's pool client-side from the preceptor list plus the rotation. The admin calendar derives per-day counts the same way (or from an enriched `schedule-calendar` response). No new public endpoint is strictly required.

**7. Email carries an optional preceptor name.**
`buildShiftApprovedEmail` gains an optional `preceptor_name`; `schedule-action` resolves the assigned preceptor's name and includes it only when present. Email remains best-effort.

## Risks / Trade-offs

- **Rotation is a plan, not attendance** → the calendar disclaimer and "likely preceptor" wording set expectations; sick/trade/vacation are explicitly out of scope.
- **Label↔enum drift** → mapping is centralized in `shift-rotation.ts` with a test so the hardcoded labels and enum stay aligned.
- **Capacity warning could be noisy** → it only fires when approved students exceed the pool, which is exactly the overscheduling case the Major cares about.
- **Existing approved shifts have no preceptor** → acceptable; new approvals populate the field.
- **Partial unique index on a nullable column** → supported in Postgres; verify it does not interfere with unassigned rows.

## Migration Plan

1. Add migration: create `preceptor_shift` enum; add `preceptors.shift`; add `schedules.preceptor_id` FK; add partial unique index `(preceptor_id, date)`.
2. Apply live and update `database.types.ts`.
3. Ship code (helpers, endpoint, UI, email) together.
4. Rollback: drop the column/index/enum; code reverts cleanly since the fields are additive and nullable.

## Open Questions

- Should the admin calendar count come from an enriched `schedule-calendar` response or a client-side join against the preceptor list? (Assumed client-side/reused for v1.)
- Should a shift with no assigned preceptor but non-empty pool be visually flagged on the approval card as "unpaired"? (Assumed not required for v1.)
- Exact disclaimer copy (assumed: "Preceptor coverage is based on the 24/48 rotation, not the schedule, and does not reflect comp time, vacation, sick days, or traded shifts.").
