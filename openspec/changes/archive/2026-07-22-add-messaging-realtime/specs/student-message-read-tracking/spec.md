## MODIFIED Requirements

### Requirement: Student per-thread read cursor
The system SHALL track when a student last read admin messages in their conversation thread using a single read-cursor timestamp stored in `student_message_read_state`. The cursor SHALL be updatable only by the authenticated student who owns the row. The unread count derived from this cursor SHALL update in real-time on the dashboard when new admin messages arrive.

#### Scenario: First-time read tracking
- **WHEN** a student opens their messages tab for the first time and one or more admin messages exist
- **THEN** the system creates a `student_message_read_state` row with `last_read_admin_message_at` set to the latest admin message's `created_at`
- **AND** subsequent unread counts exclude messages at or before that timestamp

#### Scenario: Student reads new admin messages
- **WHEN** a student opens their messages tab after an admin has sent new messages since the last read
- **THEN** the system updates `last_read_admin_message_at` to the latest admin message's `created_at`
- **AND** the unread count returns to zero

#### Scenario: No admin messages exist
- **WHEN** a student opens their messages tab and no admin messages exist in the thread
- **THEN** the system does not create or update a read-cursor row
- **AND** the unread count remains zero

### Requirement: Dashboard unread message count
The student dashboard message summary card SHALL display the count of unread admin messages instead of the total message count. An unread admin message is one where `sender = 'admin'` and `created_at` is greater than the student's `last_read_admin_message_at` cursor (or all admin messages if no cursor exists). The unread count SHALL update in real-time when new admin messages arrive and the student is not actively viewing the Messages section.

#### Scenario: Unread admin messages are visually distinguished
- **WHEN** a student views their messages and an admin message is newer than their read cursor
- **THEN** the message bubble displays a 3px crimson left border as the unread indicator
- **AND** read messages display without the accent border

#### Scenario: Unread messages shown on dashboard
- **WHEN** a student opens their dashboard and one or more admin messages are newer than their read cursor
- **THEN** the message summary card displays the unread count with a label indicating unread messages from staff
- **AND** the unread count updates in real-time when new admin messages arrive

#### Scenario: No unread messages
- **WHEN** a student opens their dashboard and no admin messages are newer than their read cursor
- **THEN** the message summary card displays zero with a label indicating no unread messages

#### Scenario: No messages at all
- **WHEN** a student opens their dashboard and no messages exist in their thread
- **THEN** the message summary card displays zero with a label indicating the thread is empty
