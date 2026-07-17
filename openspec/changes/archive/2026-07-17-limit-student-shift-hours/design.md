## Context

The student modal currently offers a 24-hour Full Shift and exposes custom times through 2300. The API validates only non-empty text, so UI restrictions alone cannot enforce the 2200 cutoff.

## Goals / Non-Goals

**Goals:**
- Limit all newly requested student ride times to 0700-2200.
- Replace the 24-hour preset with an Extended Shift preset.
- Apply the same policy in the client and API.

**Non-Goals:**
- Modify existing schedule records or the schedule database enum.
- Change admin scheduling, cancellation, iCal historical-event handling, or the department rotation.

## Decisions

### Decision: Keep the existing `full` stored value for Extended Shift

The UI label changes to Extended Shift while the request continues to store `shift_type = 'full'`. This avoids a schema migration and preserves existing consumers.

### Decision: Validate a single shared allowed-time range on the server

The shared time source will exclude times outside 0700-2200. Request validation will require both values from that set and require custom end time to be later than start time. Presets will be validated as their exact fixed ranges.

### Decision: Preserve historical 24-hour records

No data migration occurs. Existing 0700-to-0700 records continue to display and export; the restriction applies only when creating new requests.

## Risks / Trade-offs

- [The `full` stored value no longer literally means 24 hours] -> Keep it as an internal compatibility value and present only Extended Shift to students.
- [Direct API callers bypass the modal] -> Enforce allowed times and ordering in the request schema.

## Migration Plan

Deploy UI and validation changes together. Rollback restores the previous client choices and API validation without changing stored schedules.

## Open Questions

- None.
