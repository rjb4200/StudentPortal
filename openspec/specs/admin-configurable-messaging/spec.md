# admin-configurable-messaging

**Purpose:** Allow training staff to send broadcast messages, manage reusable message templates, and configure a welcome message shown to students on their dashboard after onboarding.

## Requirements

### Requirement: Admin message broadcasts
The system SHALL allow admin users to compose and send a message to all certified students simultaneously from the Admin Command Center.

#### Scenario: Send broadcast
- **WHEN** an admin composes a broadcast message and sends it
- **THEN** the message is delivered to the inbox of every certified student

#### Scenario: Broadcast to empty roster
- **WHEN** an admin sends a broadcast and no certified students exist
- **THEN** the system confirms there are no recipients without creating messages

### Requirement: Admin message templates
The system SHALL allow admin users to create, edit, and delete reusable message templates from the Admin Command Center.

#### Scenario: Create template
- **WHEN** an admin creates a template with title and body text
- **THEN** the template is stored and available for quick insertion when composing messages or broadcasts

#### Scenario: Use template in broadcast
- **WHEN** an admin selects a template while composing a broadcast
- **THEN** the template body populates the broadcast message text

#### Scenario: Use template in 1:1 reply
- **WHEN** an admin selects a template while replying to an individual student
- **THEN** the template body populates the reply text

### Requirement: Configurable onboarding welcome message
The system SHALL allow admin users to configure a welcome message displayed to students after completing onboarding or after registration approval.

#### Scenario: Configure welcome message
- **WHEN** an admin sets a welcome message title and body text
- **THEN** the message is displayed on the student dashboard after onboarding completion

#### Scenario: Deactivate welcome message
- **WHEN** an admin deactivates the welcome message
- **THEN** no welcome message is shown to students

### Requirement: Messaging configuration security
The system SHALL restrict message template, broadcast, and welcome message writes to admin users. Authenticated students SHALL receive broadcasts and see the welcome message.

#### Scenario: Non-admin broadcast blocked
- **WHEN** a non-admin user attempts to create a broadcast
- **THEN** the database rejects the operation

#### Scenario: Anonymous user cannot receive broadcasts
- **WHEN** an unauthenticated user attempts to read broadcast messages
- **THEN** the database returns no results
