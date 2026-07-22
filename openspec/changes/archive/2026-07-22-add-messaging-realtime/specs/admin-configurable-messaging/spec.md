## MODIFIED Requirements

### Requirement: Admin message broadcasts
The system SHALL allow admin users to compose and send a message to all certified students simultaneously from the Admin Command Center. Broadcast messages SHALL be delivered to subscribed students in real-time via Supabase Realtime.

#### Scenario: Send broadcast
- **WHEN** an admin composes a broadcast message and sends it
- **THEN** the message is delivered to the inbox of every certified student
- **AND** subscribed students viewing their Messages section see the broadcast appear in real-time

#### Scenario: Broadcast to empty roster
- **WHEN** an admin sends a broadcast and no certified students exist
- **THEN** the system confirms there are no recipients without creating messages
