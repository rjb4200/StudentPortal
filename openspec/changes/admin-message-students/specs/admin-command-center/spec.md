## ADDED Requirements

### Requirement: Student roster message action
Each Student Roster row SHALL provide a Message action that opens the Messages tab with that student's conversation selected and the composer focused and ready for input. The action SHALL work whether or not the student has an existing conversation.

#### Scenario: Admin starts a message from the roster
- **WHEN** an admin clicks the Message action on a Student Roster row
- **THEN** the Messages tab is selected
- **AND** that student's conversation is open
- **AND** the message composer is focused and ready for the admin to type

#### Scenario: Roster message action opens an existing conversation
- **WHEN** an admin clicks the Message action for a student who already has messages
- **THEN** the existing conversation is displayed with its prior messages

#### Scenario: Roster message action opens a new conversation
- **WHEN** an admin clicks the Message action for a student who has never exchanged messages
- **THEN** an empty conversation is opened with a working composer

### Requirement: Student roster unread message bubble
The Student Roster SHALL display a per-student unread message count bubble on rows where the authenticated admin has one or more unread student messages in that conversation.

#### Scenario: Unread count bubble is shown
- **WHEN** an admin views the Student Roster and a student has two unread messages for that admin
- **THEN** the student's row displays a badge indicating the unread count of two

#### Scenario: Bubble hidden when read
- **WHEN** an admin views the Student Roster and a student has no unread messages for that admin
- **THEN** the student's row does not display an unread message bubble

#### Scenario: Bubble is not color-only
- **WHEN** an admin views the unread message bubble
- **THEN** the bubble conveys the unread count as text, not by color alone

## MODIFIED Requirements

### Requirement: Threaded messaging
The admin messages tab SHALL include a messaging view that supports threaded conversations between admin and individual students. Messages SHALL be scoped by `student_id` and include a sender role (`student` or `admin`). Student messages and admin replies SHALL be created through authenticated server endpoints and the messaging view SHALL display a visible error when a send fails. The messages tab SHALL select a student's conversation when opened with a valid `student` query parameter.

#### Scenario: Admin sends message to student
- **WHEN** an admin selects a student from the message list, types a message, and sends
- **THEN** a message record is created with `sender = 'admin'` and `student_id` linking to the selected student
- **AND** the student sees the message in their dashboard

#### Scenario: Student sends message to admin
- **WHEN** an eligible student sends a message from their dashboard
- **THEN** a message record is created with `sender = 'student'` and appears in the admin messaging window under that student's thread

#### Scenario: Admin opens a deep-linked conversation
- **WHEN** an admin opens the Admin Command Center with the Messages tab selected and a valid `student` query parameter
- **THEN** the matching student conversation is selected after the messages load

#### Scenario: Admin opens a deep-linked conversation without history
- **WHEN** an admin opens the Admin Command Center with the Messages tab selected and a `student` query parameter for a student with no prior messages
- **THEN** an empty conversation for that student is selected with a working composer

#### Scenario: Admin message send fails
- **WHEN** an admin reply cannot be persisted
- **THEN** the messaging window displays an actionable error and retains the entered reply text
