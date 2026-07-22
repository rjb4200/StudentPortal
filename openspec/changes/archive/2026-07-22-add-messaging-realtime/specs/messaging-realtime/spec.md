## ADDED Requirements

### Requirement: Real-time message delivery for students
The system SHALL deliver new messages to the student's conversation view in real-time using Supabase Realtime subscriptions. The student SHALL see new admin messages and broadcast messages appear without manual refresh.

#### Scenario: Student receives admin reply in real-time
- **WHEN** a student has their Messages section open and an admin replies to their conversation
- **THEN** the new admin message appears in the conversation view within seconds without the student refreshing or re-navigating
- **AND** the message is appended to the existing message list in correct chronological order

#### Scenario: Student receives broadcast in real-time
- **WHEN** a student has their Messages section open and an admin sends a broadcast
- **THEN** the broadcast message appears in the student's conversation view within seconds

#### Scenario: Student not viewing Messages
- **WHEN** a student is viewing a different dashboard section (Schedule, Resources, etc.) and a new admin message arrives
- **THEN** the message does not appear in the Messages view until the student navigates to it
- **AND** the unread badge on the Messages nav button increments

### Requirement: Real-time inbox updates for admins
The system SHALL update the admin message inbox list in real-time when new student messages arrive. The system SHALL deliver new messages to the active conversation view when an admin is viewing a specific student thread.

#### Scenario: Admin sees new student message in inbox
- **WHEN** an admin has the Messages tab open and a student sends a new message
- **THEN** the student's thread appears at the top of the inbox list (or updates its position) within seconds
- **AND** the thread shows the new message preview and is marked as unread

#### Scenario: Admin viewing conversation sees new message
- **WHEN** an admin is viewing a specific student conversation and that student sends a new message
- **THEN** the new message appears in the conversation view within seconds
- **AND** the message is appended in correct chronological order

#### Scenario: Admin not viewing Messages tab
- **WHEN** an admin is on a different admin tab (Daily Ops, Calendar, etc.) and a student sends a new message
- **THEN** the unread badge on the Messages nav tab increments

### Requirement: Live unread count badges
The unread count badges (admin Messages tab and student dashboard Messages button) SHALL update in real-time when new messages arrive or when messages are marked as read.

#### Scenario: Admin badge increments on new student message
- **WHEN** an admin is not viewing the Messages tab and a student sends a new message
- **THEN** the unread badge on the Messages nav tab increments to reflect the new unread conversation count

#### Scenario: Student badge increments on new admin message
- **WHEN** a student is not viewing the Messages section and an admin replies or sends a broadcast
- **THEN** the unread badge on the Messages section nav button increments

#### Scenario: Badge clears when messages are read
- **WHEN** a user marks messages as read (by opening the conversation or Messages section)
- **THEN** the corresponding badge updates to reflect the new unread count (including zero)

### Requirement: Graceful degradation
The system SHALL fall back to on-demand message fetching when the real-time connection is unavailable or fails to establish.

#### Scenario: Real-time connection fails
- **WHEN** the Supabase Realtime WebSocket connection cannot be established or is interrupted
- **THEN** messages remain accessible via the existing on-demand fetch pattern (initial page load)
- **AND** the user is not blocked from sending or viewing messages
- **AND** a subtle disconnected indicator may be shown

#### Scenario: Real-time connection recovers
- **WHEN** the WebSocket connection recovers after a temporary interruption
- **THEN** the system re-subscribes and resumes delivering messages in real-time
- **AND** any messages missed during the interruption appear on the next fetch or navigation
