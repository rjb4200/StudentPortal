## 1. Remove Runtime Integration

- [x] 1.1 Remove direct Pushover API calls from onboarding completion notifications while preserving existing Resend admin and student emails.
- [x] 1.2 Remove direct Pushover API calls from flagged evaluation notifications while preserving existing Resend admin emails.
- [x] 1.3 Remove Pushover alerting from the health-check failure path so `/api/health` returns an unhealthy response without push delivery.
- [x] 1.4 Delete the unused Pushover utility module after all imports are removed.

## 2. Remove Environment Configuration

- [x] 2.1 Remove `PUSHOVER_APP_TOKEN` and `PUSHOVER_USER_KEY` from the server environment export.
- [x] 2.2 Remove Pushover variables and comments from `.env.example`.
- [x] 2.3 Remove Pushover variables from repository environment documentation in `AGENTS.md`.

## 3. Update OpenSpec

- [x] 3.1 Update active `notifications-alerts` specs so Pushover admin alerts and priority escalation are no longer required.
- [x] 3.2 Update active `data-management` specs so health-check failures no longer require Pushover emergency notifications.
- [x] 3.3 Update active `env-validation` specs so Pushover tokens are no longer part of the server environment contract.
- [x] 3.4 Decide whether archived OpenSpec history should be scrubbed for literal repo-wide search silence or left as historical context.

## 4. Verification

- [x] 4.1 Run `npm run build`.
- [x] 4.2 Search active implementation and active spec paths for `Pushover`, `PUSHOVER`, and `pushover.net` and confirm no active references remain.
- [x] 4.3 Confirm any remaining matches are only accepted historical migration/archive notes, if archive scrubbing is not performed.
