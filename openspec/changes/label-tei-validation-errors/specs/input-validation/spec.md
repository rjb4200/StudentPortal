## ADDED Requirements

### Requirement: TEI validation feedback identifies fields
The TEI registration workflow SHALL display each validation error with a human-readable name for the affected field and SHALL not repeat identical field/message combinations.

#### Scenario: Generic schema message has field context
- **WHEN** registration validation returns a generic message for a field
- **THEN** the active step identifies the field needing correction alongside that message
