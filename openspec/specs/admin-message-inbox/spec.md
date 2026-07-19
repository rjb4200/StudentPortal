## Purpose

Define admin-specific unread conversation state and inbox indicators for Student Messages.

## Requirements

### Requirement: Per-admin unread conversation state
The system SHALL track the latest student-originated message reviewed by each active admin account for each student conversation independently.

#### Scenario: New thread is unread for every admin
- **WHEN** a student sends a message and an active admin has not reviewed that conversation
- **THEN** the conversation is unread for that admin
- **AND** one admin reviewing the conversation does not change its unread state for another admin

#### Scenario: Admin opens an unread conversation
- **WHEN** an authenticated admin opens a conversation containing an unread student message
- **THEN** the system records that admin's latest reviewed student-message time for the conversation
- **AND** the conversation is no longer unread for that admin

#### Scenario: New message follows an acknowledged conversation
- **WHEN** a student sends a message after an admin has reviewed the prior student message in that conversation
- **THEN** the conversation becomes unread again for that admin

### Requirement: Student Messages inbox indicators
The system SHALL present actionable visual message-state information in both the Messages tab and the Daily Operations Action Required card for the authenticated admin.

#### Scenario: Unread conversations are visible in Messages tab
- **WHEN** one or more student conversations contain unread messages for the authenticated admin
- **THEN** the Messages tab displays an unread conversation count
- **AND** each unread conversation has a non-color-only unread indicator and distinguishable visual treatment

#### Scenario: Unread conversations are visible in Action Required
- **WHEN** one or more student conversations contain unread messages for the authenticated admin
- **THEN** the Daily Operations Action Required card displays an Unread Messages item with the count of unread threads and a "View Messages" button

#### Scenario: Inbox prioritizes unread conversations
- **WHEN** the Messages tab renders the thread list
- **THEN** unread conversations appear before read conversations
- **AND** conversations in each group are ordered by most recent message activity

#### Scenario: Thread preview identifies recent context
- **WHEN** a student conversation has one or more messages
- **THEN** its list entry displays the latest-message preview and timestamp
- **AND** its list entry indicates when the latest message is from the student and needs staff response

#### Scenario: Empty conversation list remains understandable
- **WHEN** no student conversations have messages
- **THEN** the Messages tab displays an empty state that explains that no student messages are available

### Requirement: Authorized inbox state access
The system SHALL restrict conversation-state reads and updates to the authenticated active admin account that owns the state.

#### Scenario: Admin identity is resolved server-side
- **WHEN** an admin acknowledges a conversation as read
- **THEN** the system resolves the admin account from the authenticated session
- **AND** the client cannot acknowledge a conversation on behalf of another admin account

#### Scenario: Non-admin access is denied
- **WHEN** a non-admin user attempts to read or update admin conversation state
- **THEN** the system denies access without exposing message-state data
