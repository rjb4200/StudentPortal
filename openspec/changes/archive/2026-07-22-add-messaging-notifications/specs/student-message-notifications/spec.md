## ADDED Requirements

### Requirement: Student email notification on admin reply
The system SHALL send a best-effort email notification to the student when an admin replies to their message thread. The email SHALL include the admin's reply text, student context, and a link to the dashboard Messages tab using the WFD-branded HTML template. Email delivery failure SHALL NOT undo the persisted message or prevent the reply from being returned to the client.

#### Scenario: Student receives reply notification
- **WHEN** an admin replies to a student conversation
- **THEN** the student receives an email containing the admin's message excerpt and a link to the dashboard Messages section
- **AND** the reply message is available in the conversation regardless of email delivery

#### Scenario: Student email address is missing
- **WHEN** an admin replies to a student with no email address on file
- **THEN** the system skips email delivery without error
- **AND** the reply is persisted and returned normally
