## ADDED Requirements

### Requirement: Per-conversation unread message count
The admin message inbox SHALL expose, for each student conversation, the number of student-originated messages that are unread for the authenticated admin, consistent with that admin's per-conversation unread state. The count SHALL be zero when the conversation has no unread student messages.

#### Scenario: Unread count reflects pending student messages
- **WHEN** a student sends two messages and the authenticated admin has read none of them
- **THEN** the inbox exposes an unread count of two for that conversation

#### Scenario: Unread count resets after the admin reads
- **WHEN** an admin opens a conversation containing unread student messages
- **THEN** that conversation's unread count becomes zero for that admin

#### Scenario: Unread count is independent per admin
- **WHEN** two admins each have different reviewed times for the same conversation
- **THEN** each admin's unread count for that conversation reflects only their own unread state

#### Scenario: Count is zero for conversations without unread messages
- **WHEN** a conversation has no unread student messages for the authenticated admin
- **THEN** the inbox exposes an unread count of zero for that conversation

#### Scenario: Admin-initiated messages do not add to the unread count
- **WHEN** an admin sends a message to a student who has not replied
- **THEN** the conversation's unread count remains zero for that admin

### Requirement: Admin-initiated conversation with any student
The Messages tab SHALL allow an authenticated admin to start a conversation with any non-blacklisted student, including students who have never exchanged messages. Selectable students SHALL include `pending`, `certified`, and `expired` statuses and SHALL exclude blacklisted students. The student selection SHALL be searchable by name and email.

#### Scenario: Admin starts a conversation with a student who has no history
- **WHEN** an admin selects a non-blacklisted student who has never exchanged messages and sends a message
- **THEN** an empty conversation is opened with a working composer
- **AND** a message record is created with `sender = 'admin'` and the selected `student_id`
- **AND** the student receives the message in-app and by email

#### Scenario: Selectable students include all non-blacklisted statuses
- **WHEN** an admin opens the student selection for a new message
- **THEN** non-blacklisted `pending`, `certified`, and `expired` students are selectable

#### Scenario: Blacklisted students are excluded
- **WHEN** an admin opens the student selection for a new message
- **THEN** blacklisted students are not selectable

#### Scenario: Student selection is searchable
- **WHEN** an admin types part of a student's name or email in the selection search
- **THEN** the list is filtered to matching students

#### Scenario: Newly started conversation appears in the inbox
- **WHEN** an admin sends the first message in a newly started conversation
- **THEN** that conversation appears in the Messages tab thread list without a manual page reload

#### Scenario: Non-admin cannot select students for messaging
- **WHEN** a non-admin user attempts to list students for messaging or start a conversation
- **THEN** the system denies access without exposing student data
