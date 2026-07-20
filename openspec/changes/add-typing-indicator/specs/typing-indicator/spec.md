## ADDED Requirements

### Requirement: Typing indicator in student↔admin conversations
The system SHALL display a typing indicator when the other party is composing a message in a conversation. The indicator SHALL be delivered via Supabase Realtime Broadcast channels and SHALL require no database writes. Broadcast compose SHALL NOT trigger typing indicators.

#### Scenario: Admin sees student typing
- **WHEN** a student types in the Messages input on their dashboard
- **THEN** a debounced Broadcast event is sent over the typing channel for that student
- **AND** any admin viewing that student's conversation sees "{Student Name} is typing..." below the message list

#### Scenario: Student sees admin typing
- **WHEN** an admin types a reply in a student conversation
- **THEN** a debounced Broadcast event is sent over the typing channel for that student
- **AND** the student sees "Staff is typing..." below the message list in their dashboard

#### Scenario: Typing indicator clears after inactivity
- **WHEN** the typing party stops typing for 3 seconds
- **THEN** an idle event is sent and the indicator clears on the receiving side
- **AND** the receiving side also clears the indicator after 4 seconds of no typing events as a safety net

#### Scenario: Broadcast compose does not trigger typing indicator
- **WHEN** an admin types in the broadcast compose modal
- **THEN** no typing Broadcast events are sent

#### Scenario: User does not see their own typing indicator
- **WHEN** a typing event is received from the Broadcast channel
- **THEN** the receiving client compares the sender field and does NOT display an indicator for its own typing events
