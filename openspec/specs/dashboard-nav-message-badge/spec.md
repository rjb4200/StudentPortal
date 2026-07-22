## Purpose

TBD

## Requirements

### Requirement: Messages section nav unread badge
The student dashboard section navigation SHALL display an unread count badge on the Messages button when the student has one or more unread admin messages.

#### Scenario: Student has unread admin messages
- **WHEN** the student has one or more admin messages where `created_at` is newer than the student's `last_read_admin_message_at` cursor
- **THEN** the Messages section navigation button displays a crimson badge showing the unread count
- **AND** the badge is visually consistent with the dashboard's WFD styling (small circle with white text on crimson background)

#### Scenario: Student has read all admin messages
- **WHEN** the student has read all admin messages or no messages exist
- **THEN** the Messages section navigation button displays without a badge

#### Scenario: Badge clears after student opens Messages
- **WHEN** a student opens the Messages section (triggering `POST /api/messages/mark-read`)
- **THEN** the badge on the Messages nav button disappears
- **AND** the unread count in the dashboard summary card also updates to zero
