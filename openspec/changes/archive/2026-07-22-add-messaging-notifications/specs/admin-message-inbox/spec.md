## ADDED Requirements

### Requirement: Unread badge on admin navigation Messages tab
The admin navigation SHALL display a crimson unread count badge on the Messages tab label when the authenticated admin has one or more unread student conversations. The badge SHALL use the same unread conversation count already available from the admin message inbox API.

#### Scenario: Badge visible in navigation bar
- **WHEN** the authenticated admin has unread student conversations
- **THEN** the Messages tab in the primary navigation bar displays a crimson badge with the unread count
- **AND** the badge is visible without opening the Messages tab

#### Scenario: Badge hidden when all conversations are read
- **WHEN** the authenticated admin has no unread conversations
- **THEN** the Messages tab displays without a badge
