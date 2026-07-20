## MODIFIED Requirements

### Requirement: Dashboard summary cards
The student dashboard SHALL display summary cards for account status, next scheduled shift, pending requests, and unread messages. The messages summary card SHALL display the count of unread admin messages rather than the total message count. The unread count SHALL update in real-time when new admin messages arrive and the student is not actively viewing the Messages section. Summary cards SHALL use concise labels, clear state indicators, and direct actions where applicable.

#### Scenario: Summary cards show key student state
- **WHEN** a student opens the dashboard
- **THEN** the dashboard displays account status, next shift, pending requests, and unread message summary cards
- **AND** each card communicates its state without requiring the student to navigate into another section first

#### Scenario: Unread messages shown on summary card
- **WHEN** a student has one or more unread admin messages
- **THEN** the messages summary card displays the unread count with a label indicating messages from staff
- **AND** the count updates in real-time without page refresh

#### Scenario: No unread messages
- **WHEN** a student has read all admin messages in their thread
- **THEN** the messages summary card displays zero with a label indicating no unread messages

#### Scenario: Empty states include direct actions
- **WHEN** a summary card has no data, such as no next shift or no messages
- **THEN** the card displays a concise empty state with a relevant action or explanation

## ADDED Requirements

### Requirement: Live unread count on section navigation
The unread count badge on the Messages section navigation button SHALL update in real-time when new admin messages arrive while the student is not viewing the Messages section.

#### Scenario: Badge increments on new admin message
- **WHEN** a student is viewing a non-Messages dashboard section and an admin sends a reply or broadcast
- **THEN** the unread badge on the Messages nav button increments in real-time

#### Scenario: Badge decrements when student opens Messages
- **WHEN** a student navigates to the Messages section
- **THEN** the system marks messages as read and the badge disappears in real-time
