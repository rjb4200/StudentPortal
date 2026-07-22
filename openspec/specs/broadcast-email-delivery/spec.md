## Purpose

TBD

## Requirements

### Requirement: Optional broadcast email delivery
The system SHALL allow admin users to optionally send broadcast messages via email in addition to in-app delivery. Email delivery SHALL be best-effort and SHALL NOT affect in-app message delivery.

#### Scenario: Admin sends broadcast with email enabled
- **WHEN** an admin composes a broadcast and checks the "Also send by email" option before sending
- **THEN** individual messages are inserted into the `messages` table for each certified non-blacklisted student
- **AND** each recipient receives an email containing the broadcast title and body via Resend
- **AND** the broadcast recipient count reflects the number of in-app messages delivered

#### Scenario: Admin sends broadcast without email
- **WHEN** an admin composes a broadcast and does not check the "Also send by email" option
- **THEN** individual messages are inserted into the `messages` table as usual
- **AND** no emails are sent

#### Scenario: Broadcast email delivery fails for some recipients
- **WHEN** broadcast email delivery fails for one or more recipients
- **THEN** in-app message delivery is unaffected for all recipients
- **AND** the delivery failures are logged server-side
- **AND** the admin is not shown individual delivery errors (the broadcast completes normally)

#### Scenario: Broadcast with no eligible recipients
- **WHEN** an admin sends a broadcast and no certified non-blacklisted students exist
- **THEN** the system confirms there are no recipients without creating messages or sending emails
