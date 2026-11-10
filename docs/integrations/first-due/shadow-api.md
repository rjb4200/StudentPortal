# First Due — web surface (captured, undocumented)

The First Due web app calls same-origin endpoints at the site root. These are
**not** the documented `/fd-api/v1` API and are not covered by any contract.
They can change without notice.

Provenance (2026-11-10): authenticated Playwright session against the tenant;
read endpoints called live; the write payload model extracted from the app
bundle `scripts/event_log_v2.*.js`; create, update, and delete each exercised
once against a disposable event (see "Verified write").

## Session

- Sign-in is two steps: `POST /auth/identifier`, then `POST /auth/password-challenge`.
- Authentication after that is **cookie-based**; no `Authorization` header was
  observed on web API calls.
- The session is long-lived (the account is only prompted to sign in roughly
  once a year). Treat the cookie as a year-long credential.
- Requests observed carry `content-type: application/json;charset=UTF-8` and
  `x-requested-with: XMLHttpRequest`, with a same-origin `referer`. No CSRF
  token was observed on the read calls.

## Read endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/event-log/getEventTypes?pageSize=1000&type=all` | Event type lookup (id, name, shortcode, color) |
| `GET` | `/event-log/getStations` | Stations (form filter/lookups) |
| `GET` | `/event-log/getApparatus` | Apparatus (form lookups) |
| `GET` | `/eventCreationLog/bootstrap` | Form bootstrap |
| `GET` | `/eventCreationLog/getQuickLinks` | Form shortcuts |
| `POST` | `/event-calendar/getActivities` | Calendar/list projection for a date range |
| `GET` | `/event-log/getActivityInfo?id=<id>&module=Event&date=<MM/DD/YYYY>` | Full event record, including `notes` |

### `getActivities` request

```json
{
  "calendar_mode": "week",
  "date_from": "2026-11-09",
  "date_to": "2026-11-15",
  "filters": {
    "period": "other",
    "name": "",
    "module": ["Event", "Training", "NFIRS/EPCR", "Inspection", "Asset", "Work Shift", "Time Off", "Daily Log"],
    "event_type_id": [11126, 9975],
    "view": "calendar",
    "date_from": "2026-11-09",
    "date_to": "2026-11-15"
  }
}
```

### `getActivities` response

```json
{
  "result": true,
  "msg": "",
  "records": [
    {
      "id": 2190834,
      "name": "…",
      "module": "Event",
      "color": "#2196f3",
      "activity_date_local": "11/10/2026",
      "activity_time_local": "07:30",
      "activity_date_local_end": "11/10/2026",
      "activity_time_local_end": "16:00"
    }
  ]
}
```

The list projection has **no `notes` field**. A correlation token stored in
notes is not visible here; verification must call `getActivityInfo`.

### `getActivityInfo` response

```json
{
  "success": true,
  "activity": {
    "id": 2190834,
    "name": "…",
    "start_at": "11/10/2026 07:30:00",
    "end_at": "11/10/2026 16:00:00",
    "event_type_id": [11098],
    "status_code": "incomplete",
    "notes": "…",
    "all_day_event": false,
    "require_status_update": false,
    "…": "50 fields total including address, stations, apparatus, attendees"
  }
}
```

## Write endpoint

`POST /eventCreationLog/save`

```json
{ "event_log": { /* full event object */ } }
```

The form submits the **whole** object (the UI merges edits into its `eventData`
state), so an update should be a read-merge-write, not a partial patch. Legacy
variants exist (`/event-log/createEvent`, `/event-log/updateEvent`) and are
selected by the app for recurrence/edit cases; the new UI uses
`eventCreationLog/save`.

### Verified write (2026-11-10)

A disposable event was created, verified, renamed, and deleted end to end.

Create response:

```json
{ "result": true, "msg": "Event saved successfully.",
  "data": { "event_log": { "id": 2298846, "status_code": "incomplete",
    "start_at": "2026-11-10 12:00:00", "end_at": "2026-11-10 13:00:00",
    "client_code": "WINCHESTER_KY", "locked_by": 273803, "…": "…" } } }
```

Confirmed behavior:

- `status_code` is **server-controlled**. Sending `"ACTIVE"` was ignored; the
  created event is stored as `incomplete`.
- **Input local, storage UTC.** Posting `start_at: "11/10/2026 07:00:00"`
  stored `start_at: "2026-11-10 12:00:00"` (07:00 EST → 12:00 UTC). The save
  response and the documented API report UTC; `getActivityInfo` reports local
  again.
- Update works through the same endpoint with `id` present. Renaming to
  `[CANCELLED] …` persisted and left `notes` (and the token) byte-identical.
- Delete is `POST /event-log/deleteEvent` with `{ "id": <id> }` →
  `{"result":true,"msg":"Event has been deleted successfully!"}`. After
  deletion, `getActivityInfo` returns `{"success":true,"activity":{}}` — an
  empty object, not a 404.

### `event_log` payload model (from the app bundle)


```js
{
  name: "",
  notes: "",
  start_at: "",              // "MM/DD/YYYY HH:mm:ss" — LOCAL wall clock
  end_at: "",
  event_type_id: [],         // array, even for one type
  require_status_update: false,
  allow_clock_in_attendance: false,
  all_day_event: false,
  isRecurrentEvent: false,
  is_indefinite: false,
  is_eligible: false,
  young_children_attendees: null,
  school_children_attendees: null,
  adult_attendees: null,
  senior_adult_attendees: null,
  associated_apparatus: [],
  apparatus_department_id: [],
  fire_station_id: [],
  batt_dept_shift_id: [],
  address1: "", address2: "", city: "", state_code: "", county_code: "", zip: "",
  unit_suite_code: "", gps_location: "", us_national_grid_coordinates: "",
  location_cache: "",
  attachments: [],
  recurrence: {},
  payrollSummary: [],
  // added by the client before submitting:
  status_code: "ACTIVE",     // server overrides this; new events store "incomplete"
  id: 0                      // present on update
}
```

`event_type_id` values come from `getEventTypes`. `status_code` sent by the
client is ignored on create; the server stores `incomplete`.

## Date and time

The web surface uses **local wall-clock strings**, not UTC:

- writes: `MM/DD/YYYY HH:mm:ss` (`start_at`, `end_at`)
- reads: `activity_date_local` = `MM/DD/YYYY`, `activity_time_local` = `HH:mm`
  (dates are **not zero-padded** — `11/1/2026` is normal; normalize before reuse)

This differs from the documented API's UTC contract. The portal must send
America/New_York wall-clock time to this surface, not a converted UTC instant.

## Event types present in this tenant

| id | name | shortcode | color |
|---|---|---|---|
| 11126 | Administrative Note | ADMIN | `#9e9e9e` |
| 9975 | Appearance | APR | `#ffeb3b` |
| 10951 | Company Preplan | CPP | `#ff9800` |
| 11672 | Demonstration | DEMO | `#9e9e9e` |
| 11098 | Special Event | EVNT | `#2196f3` |
| 10765 | Training | TRNG | `#009688` |

## Breakage warning

Any of this may change on a First Due release. The sync must:

- fail closed when a read returns a login page or 401/403;
- re-read after every write and compare tokens;
- raise an "update required" alert when a response no longer parses into the
  shapes above.

Do not commit capture files for this surface: they contain the session cookie
and real names. `.har`, `.saz`, and `.playwright-mcp/` are gitignored.
