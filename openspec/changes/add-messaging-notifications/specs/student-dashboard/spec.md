## MODIFIED Requirements

### Requirement: Dashboard summary cards
The student dashboard SHALL display summary cards for account status, next scheduled shift, pending requests, and unread messages. The messages summary card SHALL display the count of unread admin messages rather than the total message count. Summary cards SHALL use concise labels, clear state indicators, and direct actions where applicable.

#### Scenario: Summary cards show key student state
- **WHEN** a student opens the dashboard
- **THEN** the dashboard displays account status, next shift, pending requests, and unread message summary cards
- **AND** each card communicates its state without requiring the student to navigate into another section first

#### Scenario: Unread messages shown on summary card
- **WHEN** a student has one or more unread admin messages
- **THEN** the messages summary card displays the unread count with a label indicating messages from staff

#### Scenario: No unread messages
- **WHEN** a student has read all admin messages in their thread
- **THEN** the messages summary card displays zero with a label indicating no unread messages

#### Scenario: Empty states include direct actions
- **WHEN** a summary card has no data, such as no next shift or no messages
- **THEN** the card displays a concise empty state with a relevant action or explanation

## ADDED Requirements

### Requirement: Unread badge on Messages section navigation
The student dashboard section navigation SHALL display a crimson unread count badge on the Messages button when the student has one or more unread admin messages. The badge SHALL use the same unread count already computed for the messages summary card.

#### Scenario: Messages button shows unread badge
- **WHEN** the student has one or more unread admin messages
- **THEN** the Messages section navigation button displays a crimson badge with the unread count
- **AND** the badge is visible without selecting the Messages section

#### Scenario: Badge disappears when all messages are read
- **WHEN** the student opens the Messages section and all messages are marked as read
- **THEN** the badge disappears from the Messages navigation button
