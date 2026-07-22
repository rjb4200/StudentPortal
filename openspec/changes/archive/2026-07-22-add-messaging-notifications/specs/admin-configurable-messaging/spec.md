## ADDED Requirements

### Requirement: Broadcast email delivery option
The system SHALL allow admin users to optionally deliver broadcast messages via email to all recipients by enabling an "Also send by email" toggle in the broadcast composition interface. Email delivery SHALL be best-effort and SHALL NOT affect in-app message delivery.

#### Scenario: Broadcast sent with email enabled
- **WHEN** an admin composes and sends a broadcast with the "Also send by email" option enabled
- **THEN** each certified non-blacklisted student receives both an in-app message and an email containing the broadcast content

#### Scenario: Broadcast sent without email
- **WHEN** an admin sends a broadcast with the email option disabled or unchecked
- **THEN** only in-app messages are delivered (existing behavior)
