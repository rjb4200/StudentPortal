## Purpose

TBD

## Requirements

### Requirement: Admin reply email notification
The system SHALL send an email notification to the student when an admin replies to their message thread. Email delivery SHALL be best-effort and SHALL NOT prevent the reply from being persisted or returned to the client.

#### Scenario: Admin replies and student receives email
- **WHEN** an admin successfully sends a reply to a student conversation via `POST /api/admin/messages`
- **THEN** the reply message is inserted into the `messages` table with `sender = 'admin'`
- **AND** the system sends an email to the student's registered email address containing the reply text excerpt and a link to the dashboard Messages tab
- **AND** the API returns the persisted message regardless of email delivery outcome

#### Scenario: Email delivery fails
- **WHEN** the reply email cannot be delivered (Resend returns non-2xx)
- **THEN** the reply message remains persisted and visible in the conversation
- **AND** the delivery failure is logged server-side
- **AND** the API returns success with the persisted message

#### Scenario: Student has no email on file
- **WHEN** an admin replies to a student conversation and the student record has no email address
- **THEN** the system skips email delivery without error
- **AND** the reply message is persisted and returned normally
