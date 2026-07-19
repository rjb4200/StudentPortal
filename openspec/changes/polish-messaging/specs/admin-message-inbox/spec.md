## MODIFIED Requirements

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
