## Context

Pushover currently appears in three active runtime flows: onboarding completion, flagged evaluation alerts, and `/api/health` failure handling. Onboarding completion and flagged evaluation already have Resend-backed admin email paths, while health-check failures only attempt Pushover delivery before returning an unhealthy response.

The integration is implemented through both direct `fetch('https://api.pushover.net/1/messages.json')` calls and a small `src/lib/pushover.ts` helper. Pushover tokens are optional in `serverEnv`, documented in `.env.example`, and listed in repository instructions.

## Goals / Non-Goals

**Goals:**

- Remove all active Pushover implementation code and direct API calls.
- Remove Pushover token environment variables from the documented and typed server environment contract.
- Preserve existing Resend admin email behavior for onboarding completion and flagged evaluation workflows.
- Ensure health-check failures continue to return an unhealthy response without attempting push delivery.
- Update active OpenSpec requirements so Pushover is no longer planned or required.

**Non-Goals:**

- Add a new push notification provider.
- Add a new health-alerting mechanism in this change.
- Change admin notification preferences or database schema.
- Rewrite archived OpenSpec history unless explicitly required to satisfy search-based acceptance checks.

## Decisions

### Remove Instead of Disable

Remove Pushover code paths rather than leaving disabled guards around the old integration.

**Rationale:** The integration is no longer desired, and leaving dormant code keeps obsolete environment variables and behavior in the project.

**Alternatives considered:** Keep the helper but never configure tokens. This would still leave active implementation references and fail the cleanup goal.

### Preserve Existing Email Notifications

Keep the Resend admin email paths in onboarding completion and flagged evaluation routes.

**Rationale:** These are the currently supported notification mechanism and already respect admin account notification preferences.

**Alternatives considered:** Remove all admin alerting from those flows. That would be broader than the issue and would regress useful existing behavior.

### Do Not Replace Health Push Alerting Yet

The health endpoint should return its existing unhealthy response on database failure but should not attempt any notification side effect.

**Rationale:** The issue allows required alerting behavior to be left as a future design decision. Adding Resend health emails would create a new operational behavior that needs its own recipient and throttling decisions.

**Alternatives considered:** Send Resend email to active admins on health failure. This reuses a supported provider but risks noisy repeated emails from health probes and requires rate-limiting policy that does not exist yet.

### Treat Active Specs as the Contract

Update active specs under `openspec/specs/` and this change's delta specs. Archived change artifacts may remain historical unless the implementation phase elects to scrub them for literal repo-wide search silence.

**Rationale:** Active specs define current and planned behavior. Archived artifacts document past decisions and are not active requirements.

**Alternatives considered:** Rewrite all archived proposals, designs, tasks, and archived delta specs. This makes search output cleaner but mutates historical records.

## Risks / Trade-offs

- **[Risk] Health failures no longer generate push alerts** -> Mitigation: `/api/health` still returns an unhealthy response for Vercel or external uptime monitoring; replacement alerting can be designed separately.
- **[Risk] Archived OpenSpec files may still contain Pushover text** -> Mitigation: Acceptance checks should distinguish active specs from historical archive files, or the implementation phase can add an explicit archive-scrub task if desired.
- **[Risk] Environment variables may still exist in deployed Vercel settings** -> Mitigation: Removing code dependency makes them harmless; operations can delete them after deployment.
