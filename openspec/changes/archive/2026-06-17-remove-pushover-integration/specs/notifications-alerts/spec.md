## REMOVED Requirements

### Requirement: Pushover admin alerts
**Reason**: Pushover is no longer a supported notification service for the portal.
**Migration**: Onboarding completion and flagged evaluation admin notifications continue through the existing Resend email paths. System health push alerting is removed and any replacement alerting mechanism is a future design decision.

### Requirement: Pushover priority escalation
**Reason**: Pushover emergency priority behavior depends on the removed Pushover integration.
**Migration**: The portal no longer sends emergency push notifications. Health failures remain visible through the health endpoint response and platform monitoring.
