## MODIFIED Requirements

### Requirement: Threaded messaging
The admin daily operations tab SHALL include a messaging window that supports threaded conversations between admin and individual students. Messages SHALL be scoped by `student_id` and include a sender role (`student` or `admin`). Student messages and admin replies SHALL be created through authenticated server endpoints and the messaging window SHALL display a visible error when a send fails. Daily Operations SHALL select a student's thread when opened with a valid `student` query parameter.

#### Scenario: Admin sends message to student
- **WHEN** an admin selects a student from the message list, types a message, and sends
- **THEN** a message record is created with `sender = 'admin'` and `student_id` linking to the selected student
- **AND** the student sees the message in their dashboard

#### Scenario: Student sends message to admin
- **WHEN** an eligible student sends a message from their dashboard
- **THEN** a message record is created with `sender = 'student'` and appears in the admin messaging window under that student's thread

#### Scenario: Admin opens a deep-linked conversation
- **WHEN** an admin opens Daily Operations with a valid `student` query parameter
- **THEN** the matching student conversation is selected after the roster and messages load

#### Scenario: Admin message send fails
- **WHEN** an admin reply cannot be persisted
- **THEN** the messaging window displays an actionable error and retains the entered reply text
