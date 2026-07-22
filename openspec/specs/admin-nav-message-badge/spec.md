## Purpose

TBD

## Requirements

### Requirement: Messages tab unread badge
The admin navigation SHALL display an unread count badge on the Messages tab when the authenticated admin has one or more unread student conversations.

#### Scenario: Admin has unread conversations
- **WHEN** the authenticated admin has one or more student conversations where the latest student message is newer than the admin's read cursor for that conversation
- **THEN** the Messages tab in the admin navigation displays a crimson badge showing the count of unread conversations
- **AND** the badge is visually distinct from the tab label (small circle with white text on crimson background)

#### Scenario: Admin has no unread conversations
- **WHEN** the authenticated admin has read all student messages or no messages exist
- **THEN** the Messages tab displays without a badge

#### Scenario: Badge count updates after reading conversations
- **WHEN** an admin marks one or more conversations as read (via `POST /api/admin/message-inbox`)
- **THEN** the badge count on the Messages tab decrements to reflect the new unread count
- **AND** the badge disappears when the count reaches zero
