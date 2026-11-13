# Running the sync on a Windows PC

The Vercel cron no longer runs the First Due sync. This script replaces it and is
meant to run as a Windows Scheduled Task on an always-on ("headless") PC.

## Requirements

- Node.js 20 or newer (`node --version`)
- A copy of this repository
- Supabase service-role key
- First Due login for the account that should own the writes

## 1. Configure

Copy `scripts/first-due-sync.env.example` to `scripts/first-due-sync.env` and fill it in.
That file is gitignored and contains secrets.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | `https://ejjsahtohaydoogtilgp.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only; reads schedules, writes the ledger and job runs |
| `FIRST_DUE_EMAIL` / `FIRST_DUE_PASSWORD` | runtime login |
| `FIRST_DUE_EVENT_TYPE_ID` | event type, default `11126` (Administrative Note) |
| `FIRST_DUE_WINDOW_DAYS` | days ahead including today, default `5` |
| `DRY_RUN` | `true` = plan only, no writes |
| `FIRST_DUE_ALERT_EMAIL` + `RESEND_API_KEY` | email alerts |
| `PUSHOVER_APP_TOKEN` + `PUSHOVER_USER_KEY` | push alerts |

## 2. Test by hand

```powershell
node scripts\first-due-sync.mjs
```

Start with `DRY_RUN=true`, confirm the summary, then set `DRY_RUN=false` and run
again. Logs go to the console; the scheduled wrapper also appends to
`logs\first-due-sync.log`.

## 3. Create the scheduled task

Task Scheduler → Create Task:

- **General**: "Run whether user is logged on or not"; "Run with highest privileges"
- **Triggers**: Daily, 7:30 PM Eastern (or your preferred time)
- **Actions**: Start a program
  - Program: `C:\path\to\repo\scripts\run-first-due-sync.cmd`
  - Start in: `C:\path\to\repo`
- **Conditions**: uncheck "Start the task only if the computer is on AC power" if it is a desktop

Or from an elevated prompt:

```powershell
schtasks /Create /TN "First Due Sync" /TR "\"C:\path\to\repo\scripts\run-first-due-sync.cmd\"" /SC DAILY /ST 19:30 /RL HIGHEST /F
```

Run it once manually from Task Scheduler ("Run") and confirm the log file.

## How it behaves

- Window: today through today + `FIRST_DUE_WINDOW_DAYS` - 1, in `America/New_York`.
- Creates one Event per approved shift, titled `Student Ride — <name>`, with
  student, class, shift, and preceptor in the notes.
- Idempotent: a schedule already linked in `first_due_event_links` is skipped.
- Cancels/rejects: linked events are marked `[CANCELLED]` (delete fallback).
- Verifies every write by re-reading it; failures mark the ledger `drifted` and alert.
- Records each run in `system_job_runs` as `first_due_sync`.

## Cautions

- The runtime login may sign the same user out of other First Due sessions. Use a
  dedicated service account if possible.
- The PC must stay powered on and online at the scheduled time.
- Keep `scripts/first-due-sync.env` out of source control and restrict file permissions.
