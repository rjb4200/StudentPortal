# admin-configurable-messaging

**Purpose:** Allow training staff to send broadcast messages and configure a welcome message shown to students on their dashboard after onboarding.

## Requirements

### Requirement: Admin message broadcasts
The system SHALL allow admin users to compose and send a message to all certified students simultaneously from the Admin Command Center. Broadcast messages SHALL be delivered to subscribed students in real-time via Supabase Realtime.

#### Scenario: Send broadcast
- **WHEN** an admin composes a broadcast message and sends it
- **THEN** the message is delivered to the inbox of every certified student
- **AND** subscribed students viewing their Messages section see the broadcast appear in real-time

#### Scenario: Broadcast to empty roster
- **WHEN** an admin sends a broadcast and no certified students exist
- **THEN** the system confirms there are no recipients without creating messages

### Requirement: Configurable onboarding welcome message
The system SHALL allow admin users to configure a welcome message displayed to students after completing onboarding or after registration approval.

#### Scenario: Configure welcome message
- **WHEN** an admin sets a welcome message title and body text
- **THEN** the message is displayed on the student dashboard after onboarding completion

#### Scenario: Deactivate welcome message
- **WHEN** an admin deactivates the welcome message
- **THEN** no welcome message is shown to students

### Requirement: Broadcast email delivery option
The system SHALL allow admin users to optionally deliver broadcast messages via email to all recipients by enabling an "Also send by email" toggle in the broadcast composition interface. Email delivery SHALL be best-effort and SHALL NOT affect in-app message delivery.

#### Scenario: Broadcast sent with email enabled
- **WHEN** an admin composes and sends a broadcast with the "Also send by email" option enabled
- **THEN** each certified non-blacklisted student receives both an in-app message and an email containing the broadcast content

#### Scenario: Broadcast sent without email
- **WHEN** an admin sends a broadcast with the email option disabled or unchecked
- **THEN** only in-app messages are delivered (existing behavior)

### Requirement: Messaging configuration security
The system SHALL restrict broadcast and welcome message writes to admin users. Authenticated students SHALL receive broadcasts and see the welcome message.

#### Scenario: Non-admin broadcast blocked
- **WHEN** a non-admin user attempts to create a broadcast
- **THEN** the database rejects the operation

#### Scenario: Anonymous user cannot receive broadcasts
- **WHEN** an unauthenticated user attempts to read broadcast messages
- **THEN** the database returns no results
