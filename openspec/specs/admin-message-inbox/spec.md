## Purpose

Define admin-specific unread conversation state and inbox indicators for Student Messages.

## Requirements

### Requirement: Per-admin unread conversation state
The system SHALL track the latest student-originated message reviewed by each active admin account for each student conversation independently. The unread state SHALL update in real-time for subscribed admin clients when new student messages arrive.

#### Scenario: New thread is unread for every admin
- **WHEN** a student sends a message and an active admin has not reviewed that conversation
- **THEN** the conversation is unread for that admin
- **AND** one admin reviewing the conversation does not change its unread state for another admin
- **AND** subscribed admin clients see the new unread thread appear in their inbox in real-time

#### Scenario: Admin opens an unread conversation
- **WHEN** an authenticated admin opens a conversation containing an unread student message
- **THEN** the system records that admin's latest reviewed student-message time for the conversation
- **AND** the conversation is no longer unread for that admin

#### Scenario: New message follows an acknowledged conversation
- **WHEN** a student sends a message after an admin has reviewed the prior student message in that conversation
- **THEN** the conversation becomes unread again for that admin
- **AND** the unread state updates in real-time for subscribed admin clients

### Requirement: Student Messages inbox indicators
The system SHALL present actionable visual message-state information in both the Messages tab and the Daily Operations Action Required card for the authenticated admin. Inbox indicators SHALL update in real-time when new student messages arrive for subscribed admin clients.

#### Scenario: Unread conversations are visible in Messages tab
- **WHEN** one or more student conversations contain unread messages for the authenticated admin
- **THEN** the Messages tab displays an unread conversation count
- **AND** each unread conversation has a non-color-only unread indicator and distinguishable visual treatment
- **AND** new unread conversations appear in the list in real-time without manual refresh

#### Scenario: Unread conversations are visible in Action Required
- **WHEN** one or more student conversations contain unread messages for the authenticated admin
- **THEN** the Daily Operations Action Required card displays an Unread Messages item with the count of unread threads and a "View Messages" button

#### Scenario: Inbox prioritizes unread conversations
- **WHEN** the Messages tab renders the thread list
- **THEN** unread conversations appear before read conversations
- **AND** conversations in each group are ordered by most recent message activity
- **AND** real-time updates re-sort the list to maintain this ordering

#### Scenario: Thread preview identifies recent context
- **WHEN** a student conversation has one or more messages
- **THEN** its list entry displays the latest-message preview and timestamp
- **AND** its list entry indicates when the latest message is from the student and needs staff response

#### Scenario: Empty conversation list remains understandable
- **WHEN** no student conversations have messages
- **THEN** the Messages tab displays an empty state that explains that no student messages are available

### Requirement: Unread badge on admin navigation Messages tab
The admin navigation SHALL display a crimson unread count badge on the Messages tab label when the authenticated admin has one or more unread student conversations. The badge SHALL use the same unread conversation count already available from the admin message inbox API.

#### Scenario: Badge visible in navigation bar
- **WHEN** the authenticated admin has unread student conversations
- **THEN** the Messages tab in the primary navigation bar displays a crimson badge with the unread count
- **AND** the badge is visible without opening the Messages tab

#### Scenario: Badge hidden when all conversations are read
- **WHEN** the authenticated admin has no unread conversations
- **THEN** the Messages tab displays without a badge

### Requirement: Authorized inbox state access
The system SHALL restrict conversation-state reads and updates to the authenticated active admin account that owns the state.

#### Scenario: Admin identity is resolved server-side
- **WHEN** an admin acknowledges a conversation as read
- **THEN** the system resolves the admin account from the authenticated session
- **AND** the client cannot acknowledge a conversation on behalf of another admin account

#### Scenario: Non-admin access is denied
- **WHEN** a non-admin user attempts to read or update admin conversation state
- **THEN** the system denies access without exposing message-state data

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
