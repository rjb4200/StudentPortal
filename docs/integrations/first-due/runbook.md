# First Due events sync — runbook

## What it does

The sync runs inside the existing daily `cron_sweep` job (`0 0 * * *` UTC =
19:00 EST / 20:00 EDT) — no additional Vercel cron is used. It projects every
approved student shift in the **next five days** (today through today+4, in
America/New_York) into a First Due `Event` (Administrative Note, `11126`).
Set `FIRST_DUE_WINDOW_DAYS` to change the span.

`GET /api/cron/first-due-sync` still exists for a manual, authenticated run
(`Authorization: Bearer $CRON_SECRET`); it is not scheduled.

Cancellations and rejections do **not** wait for the daily run. The cancel and
admin schedule-action routes schedule an immediate ledger-driven cancellation
after the database write, so a same-day cancellation is reflected in First Due
within seconds. If First Due is unreachable, the cancellation still succeeds in
the portal and the daily reconciler settles it later.

## Gates

| Variable | Effect |
|---|---|
| `FIRST_DUE_SYNC_ENABLED` | Master switch. Unset/false: the job records `skipped: disabled` and does nothing. |
| `FIRST_DUE_WRITES_ENABLED` | Write gate. Unset/false: dry run — plans and verifies, writes nothing. |
| `FIRST_DUE_SESSION` | First Due web session cookie. Required only when the sync is enabled. |
| `FIRST_DUE_EVENT_TYPE_ID` | Event type id, default `11126`. |
| `FIRST_DUE_WINDOW_DAYS` | Days projected ahead, including today. Default `5`. |
| `FIRST_DUE_ALERT_EMAIL` | Operator inbox for `AUTH` / `DRIFT` / `SUMMARY` alerts. |
| `PUSHOVER_TOKEN`, `PUSHOVER_USER` | Optional push alerts. |

Recommended rollout: enable the master switch with writes **off** for a week,
review the `SUMMARY` emails, then set `FIRST_DUE_WRITES_ENABLED=true`.

## Session

The First Due web session lasts about a year. Capture the `Cookie` header from
an authenticated browser request and store it as `FIRST_DUE_SESSION` (server
only; never in git). If it expires, the canary fails closed: no writes occur and
an `AUTH` alert is emailed.

## Alerts

| Kind | Meaning | Action |
|---|---|---|
| `AUTH` | Canary got 401/403 or a login page | Refresh `FIRST_DUE_SESSION` |
| `DRIFT` | A write succeeded but the event was not re-read, or a response no longer parses | Check First Due; the endpoint may have changed |
| `SUMMARY` | Counts for the run | Informational |

## Ledger

`first_due_event_links` stores one row per schedule: token, First Due event id,
state (`planned`, `posted`, `verified`, `cancelled`, `drifted`) and timestamps.
`/admin/system` shows the last run, drift count, and session failure state.

## Manual checks

```
POST /eventCreationLog/save      { "event_log": { … } }
GET  /event-log/getActivityInfo?id=<id>&module=Event&date=MM/DD/YYYY
POST /event-log/deleteEvent      { "id": <id> }
```

See `shadow-api.md` for payloads and `field-mapping.md` for the column map.
