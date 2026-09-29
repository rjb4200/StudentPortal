## ADDED Requirements

### Requirement: Typing broadcast channel per conversation
The system SHALL support an additional Broadcast channel per conversation (`typing:{studentId}`) for ephemeral typing events, distinct from the existing `postgres_changes` channels used for message delivery.

#### Scenario: Broadcast channel created alongside message channel
- **WHEN** a student opens Messages or an admin opens a conversation
- **THEN** the system creates a Broadcast channel for typing events scoped to that student conversation
- **AND** the Broadcast channel is cleaned up when the conversation is closed or the component unmounts

#### Scenario: Broadcast channel does not interfere with message delivery
- **WHEN** typing Broadcast events are sent on the typing channel
- **THEN** message delivery via `postgres_changes` channels is unaffected
- **AND** both channels operate independently over the same WebSocket connection
