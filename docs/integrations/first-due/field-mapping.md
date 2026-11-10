# First Due — portal to Event field mapping

Source of truth for a sign-up is a `schedules` row with `status = 'approved'`.
One row produces one First Due `Event` (`module = "Event"`).

## Field map

| Portal source | First Due field | Rule |
|---|---|---|
| `schedules.id` | `first_due_event_links` | Event identity lives in the ledger, not on the event |
| `students.full_name` | `event_log.name` | `Student Ride — <full name>`; prefix `[CANCELLED] ` on cancellation |
| `students.training_class_id` → `training_classes.name` | `event_log.notes` | `Class: <name>` when the student is linked to a class |
| `schedules.date` + `start_time` | `event_log.start_at` | `MM/DD/YYYY HH:mm:ss`, America/New_York wall clock |
| `schedules.date` + `end_time` | `event_log.end_at` | same format; `end_time` may fall after midnight — end date rolls forward |
| `schedules.shift_type` | `event_log.notes` | Human context, e.g. `Day shift` |
| assigned `preceptors.full_name` | `event_log.notes` | `Preceptor: <name>` when present |
| configured constant | `event_log.event_type_id` | `[<configured type id>]`; see `events.md` |
| `false` | `event_log.all_day_event` | Student rides are timed, not all-day |
| `true` | `event_log.require_status_update` | Optional; decide with the Major |
| (omit) | `event_log.status_code` | Server sets `incomplete` on create; do not send a status |
| — | `event_log.fire_station_id`, `batt_dept_shift_id`, `apparatus_department_id` | Empty unless the Major wants the crew's station attached |

## Corpus of `notes`

The notes field carries only human context:

```
Student: <full name>
Class: <class name>
Shift: <shift_type> <start_time>–<end_time>
Preceptor: <name>
```

No internal identifier appears on the event. `[CANCELLED]` goes in `name`.

## Identity

The sync ledger (`first_due_event_links`) maps `schedule_id` to the First Due
`event_id`. It is the only identity source: idempotency, verification, and
cancellation all resolve through the ledger rather than through event text.

## Time rule (important)

The web surface does **not** take UTC. `start_at` and `end_at` are
`MM/DD/YYYY HH:mm:ss` in the tenant's local time (Eastern). This differs from
the documented `/fd-api/v1` contract, which uses UTC. Convert only if the sync
moves to the documented API; for the web surface, format the Eastern wall clock
directly (DST-aware).

## Read-back for verification

`GET /event-log/getActivityInfo?id=<id>&module=Event&date=<MM/DD/YYYY>` returns
`activity.notes`, `activity.name`, `activity.start_at`, `activity.end_at`,
`activity.event_type_id`, and `activity.status_code`. Verification reads the
ledger's `event_id`, fetches that record, and confirms the returned `id` matches.

## Update / cancel

Updates submit the **whole** object to `POST /eventCreationLog/save`
(`{ "event_log": { … } }`) merged from a fresh `getActivityInfo` read, so an
edit cannot silently blank fields the portal does not model.

Cancellation precedence:

1. read current record, prefix `name` with `[CANCELLED]`, save;
2. if the save is rejected, delete the event **only when** the ledger links it
   to a schedule;
3. never modify or delete an event that is not in the ledger.

