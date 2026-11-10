# First Due — Events & Activities model

## What "Events & Activities" contains

The module's menu exposes:

- **Daily Operations** — the event calendar (`/event-log-v2/activities/calendar`)
- **Daily Log History**
- **Setup**
- **System Log**

Daily Operations has an **Add Event** action and a separate **Add Daily Log**
action. Both appear in the same calendar feed, distinguished by the `module`
field returned by `getActivities`.

## The modules

The event log accepts these module labels (from the documented API's filter and
the web app's filter payload):

```
Event, Training, NFIRS/EPCR, Inspection, Asset,
Work Shift, Time Off, Daily Log
```

A student ride is an **`Event`**, not a Work Shift and not a Daily Log:

| Module | Meaning | Student ride? |
|---|---|---|
| `Event` | Events & Activities entry | **yes** |
| `Work Shift` | Staffing shift from Scheduling | no — students are not personnel |
| `Daily Log` | Per-apparatus daily activity log | no |
| `Training` | Training module | no |

Students are not represented as personnel. Each approved student shift becomes
its **own** `Event`, so no personnel record is created and no PII is written
into the RMS personnel directory.

## Event types available in this tenant

| id | name | shortcode |
|---|---|---|
| 11126 | Administrative Note | ADMIN |
| 9975 | Appearance | APR |
| 10951 | Company Preplan | CPP |
| 11672 | Demonstration | DEMO |
| 11098 | Special Event | EVNT |
| 10765 | Training | TRNG |

**Decision (2026-11-10):** student rides use **Administrative Note**
(`event_type_id: [11126]`, shortcode `ADMIN`). It keeps ride entries visually
neutral on the crew calendar and does not imply a training credit or a public
engagement. This is configuration, not code, so it can change without a schema
change.

## Card alignment

The calendar list projection returns:

```json
{ "id": 2190834, "name": "…", "module": "Event", "color": "#2196f3",
  "activity_date_local": "11/10/2026", "activity_time_local": "07:30",
  "activity_date_local_end": "11/10/2026", "activity_time_local_end": "16:00" }
```

`color` comes from the event type. Because the list omits `notes`, the
correlation token is only readable through
`GET /event-log/getActivityInfo?id=<id>&module=Event&date=<MM/DD/YYYY>`.
