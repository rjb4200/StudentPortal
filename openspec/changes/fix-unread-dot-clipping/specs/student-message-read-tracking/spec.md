## MODIFIED Requirements

### Requirement: Dashboard unread message count
The student dashboard message summary card SHALL display the count of unread admin messages instead of the total message count. An unread admin message is one where `sender = 'admin'` and `created_at` is greater than the student's `last_read_admin_message_at` cursor (or all admin messages if no cursor exists).

#### Scenario: Unread admin messages are visually distinguished
- **WHEN** a student views their messages and an admin message is newer than their read cursor
- **THEN** the message bubble displays a 3px crimson left border as the unread indicator
- **AND** read messages display without the accent border

#### Scenario: Unread messages shown on dashboard
- **WHEN** a student opens their dashboard and one or more admin messages are newer than their read cursor
- **THEN** the message summary card displays the unread count with a label indicating unread messages from staff

#### Scenario: No unread messages
- **WHEN** a student opens their dashboard and no admin messages are newer than their read cursor
- **THEN** the message summary card displays zero with a label indicating no unread messages

#### Scenario: No messages at all
- **WHEN** a student opens their dashboard and no messages exist in their thread
- **THEN** the message summary card displays zero with a label indicating the thread is empty
