# Tasks

## 1. Discovery and documentation

- [x] 1.1 Probe documented authentication by calling `POST /auth/token` against the tenant with the dedicated credentials; record the status, granted scopes, and whether `GET /event-log/activities` is usable. Verify the outcome is written down and decides whether the documented read can serve as the verifier.
- [x] 1.2 Capture the Events & Activities new-event form opening, including the event-type lookup request, then capture one manual event create; store captures under a gitignored path and verify `git status` does not list them.
- [x] 1.3 Capture the Events & Activities list view for a date and record the request and response shape used by the calendar. Verify the captured list can be matched to the event created in 1.2.
- [x] 1.4 Write `docs/integrations/first-due/api.md` covering base URL, auth, and the documented endpoints used or considered; verify every documented claim is cross-checked against a live or captured response.
- [x] 1.5 Write `docs/integrations/first-due/events.md` explaining Event vs. Work Shift vs. Daily Log, why student rides are Events, and the chosen event type identifier; verify it references the captured payload from 1.2.
- [x] 1.6 Write `docs/integrations/first-due/field-mapping.md` mapping `schedules` fields to event fields, including the correlation token, preceptor name, and Eastern wall-clock date formatting; verify each mapping names its source column.
- [x] 1.7 Write `docs/integrations/first-due/shadow-api.md` documenting the captured endpoint, headers, payload, capture provenance, session caveat, and a breakage warning; verify it states which parts are captured rather than documented.

## 2. Data model and configuration

- [x] 2.1 Add a migration for the First Due sync ledger (`schedule_id` unique, token, event identity, state, timestamps, last error); apply it live, regenerate `src/lib/supabase/database.types.ts`, and verify types compile.
- [x] 2.2 Extend env validation with the server-only First Due session, write/verify path selection, sync kill switch, and Pushover credentials; verify missing values are rejected only when the sync is enabled and that health reports presence without values.
- [x] 2.3 Add an `America/New_York` window helper returning today and tomorrow plus Eastern wall-clock formatting (`MM/DD/YYYY HH:mm:ss`) and ET-to-UTC conversion for the documented path; verify unit tests cover a spring-forward and a fall-back date.
- [x] 2.4 Add correlation token derive and parse helpers keyed on the schedule identity; verify unit tests round-trip and reject malformed tokens.

## 3. First Due read client

- [x] 3.1 Build a server-only client that attaches the stored session and accepts an injectable transport; verify tests run against mocked responses with no network.
- [x] 3.2 Implement the fail-closed canary that detects unauthorized responses and login-page payloads; verify tests stop the run and emit an auth alert for both cases.
- [x] 3.3 Implement window event listing with token extraction and shape validation; verify tests cover a valid payload, an empty window, and an unparsable payload.

## 4. Write path

- [x] 4.1 Implement event creation with student title, shift times as Eastern wall-clock strings, token in `notes`, and preceptor name; verify tests assert the exact payload shape.
- [x] 4.2 Implement cancellation marking with the `[CANCELLED]` title prefix and a deletion fallback restricted to token-bearing events; verify tests assert foreign events are never modified or deleted.
- [x] 4.3 Implement the idempotent plan that derives the expected set from approved schedules and skips schedules whose token already exists; verify tests prove a second plan produces zero creates.

## 5. Daily reconciliation job

- [x] 5.1 Add the daily cron route and schedule it at `0 10 * * *` in `vercel.json`; verify the route records a `system_job_runs` entry and respects the kill switch.
- [x] 5.2 Orchestrate canary, plan, write, and re-read verification, persisting ledger states across the run; verify an integration test drives the full sequence with a mocked client.
- [x] 5.3 Implement verification as a token-set comparison that marks missing or unparsable results as drift with bounded retries; verify tests cover a clean run, a missing token, and a shape change.
- [x] 5.4 Implement typed alerts (`AUTH`, `DRIFT`, `SUMMARY`) over Resend and Pushover with delivery failures logged but non-blocking; verify tests assert each alert class produces both channels.
- [x] 5.5 Add a read-only dry-run mode that is the default until writes are enabled; verify an integration test asserts zero write calls in dry-run.

## 6. Admin visibility

- [x] 6.1 Extend the system health aggregation to include the First Due sync job history, drift count, and auth alert; verify the endpoint returns them without exposing the session.
- [x] 6.2 Render the First Due job status and alerts on `/admin/system` using the shared operational components; verify the page shows a healthy, stale, and drift state from seeded run history.

## 7. Integration verification

- [x] 7.1 Run the reconciler in dry-run over a seeded week of approved, cancelled, and rejected schedules; verify the planned create and cancel sets match expectations.
- [x] 7.2 Perform one live create, verify it by independent read, then cancel it; verify the marker appears, the token is unchanged, and no foreign event was touched.
- [x] 7.3 Run `npm run test` and `npm run build`; verify both pass.

## Workflow follow-up

- Archive the change after review requirements are satisfied.
