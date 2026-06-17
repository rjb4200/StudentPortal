## Why

The Pushover integration is no longer desired and leaves obsolete notification behavior, environment variables, and OpenSpec requirements in the project. Removing it reduces operational surface area and keeps the notification contract aligned with the supported Resend email path and platform observability.

## What Changes

- Remove Pushover utility code and direct `pushover.net` API calls from active application code.
- Remove `PUSHOVER_APP_TOKEN` and `PUSHOVER_USER_KEY` from server environment exports and project environment documentation.
- Remove Pushover-specific alert behavior from onboarding completion, flagged evaluation, and health-check failure flows.
- Keep existing Resend admin email notifications for onboarding completion and flagged evaluations.
- Change health-check failure behavior so the endpoint reports failure without attempting Pushover emergency push delivery; any replacement health alerting remains a future design decision unless implemented separately.
- Update active OpenSpec specs so Pushover is no longer listed as a required or planned service.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `notifications-alerts`: Remove Pushover admin alert and priority escalation requirements while preserving Resend email and iCal feed requirements.
- `data-management`: Remove the requirement for health-check failures and capacity warnings to send Pushover emergency notifications.
- `env-validation`: Remove Pushover tokens from the server environment contract.

## Impact

- Code: `src/lib/pushover.ts`, `src/lib/env.server.ts`, `src/app/api/notify/onboarding-complete/route.ts`, `src/app/api/notify/flagged-evaluation/route.ts`, and `src/app/api/health/route.ts`.
- Documentation/configuration: `.env.example`, `AGENTS.md`, and active OpenSpec specs.
- Operations: Vercel/Supabase builds no longer depend on or document Pushover variables. Health-check failures continue returning an unhealthy response but no longer send push notifications.
- Verification: `npm run build` and repo searches for `Pushover`, `PUSHOVER`, and `pushover.net` should show no active implementation/spec references after implementation.
