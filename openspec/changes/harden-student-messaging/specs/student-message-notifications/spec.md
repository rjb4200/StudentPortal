## ADDED Requirements

### Requirement: Reliable student message submission
The system SHALL accept a student message through an authenticated server endpoint that resolves the enrollment from the authenticated user, validates non-empty bounded content, persists the message, and returns the persisted message to the dashboard.

#### Scenario: Pending student sends a message
- **WHEN** a non-blacklisted pending student submits a valid message from the dashboard
- **THEN** the message is stored with the student's enrollment ID and `sender = 'student'`
- **AND** the dashboard shows the message and a successful send state

#### Scenario: Message submission fails
- **WHEN** a student message cannot be validated or persisted
- **THEN** the dashboard displays an actionable error
- **AND** the message input remains available for correction or retry

#### Scenario: Student attempts to impersonate another enrollment
- **WHEN** a student submits a request containing another student's identifier
- **THEN** the system ignores the supplied identifier and uses the enrollment resolved from the authenticated user

### Requirement: Admin email notifications for student messages
The system SHALL send an email notification for each persisted student message to every active admin account with student-message notifications enabled. Email delivery failure SHALL NOT undo the persisted message.

#### Scenario: Opted-in admins receive a new message alert
- **WHEN** a student message is persisted and active admins have student-message notifications enabled
- **THEN** each opted-in admin receives an email containing the student context, message excerpt, and conversation link

#### Scenario: Admin opts out of message alerts
- **WHEN** an admin disables student-message notifications in Account Management
- **THEN** that admin does not receive future student-message email alerts

#### Scenario: Email provider fails
- **WHEN** the message notification email cannot be delivered
- **THEN** the student message remains stored and visible in the admin conversation
- **AND** the delivery failure is logged server-side

### Requirement: Conversation reply deep link
Student-message notification emails SHALL include an authenticated link that opens Daily Operations with the sending student's conversation selected.

#### Scenario: Admin opens a message notification link
- **WHEN** an authenticated admin follows the conversation link from a student-message email
- **THEN** Daily Operations loads with that student's message thread selected

#### Scenario: Unauthenticated user opens a message notification link
- **WHEN** an unauthenticated user follows the conversation link
- **THEN** the user is required to authenticate before accessing the admin conversation
