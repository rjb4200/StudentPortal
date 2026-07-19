## ADDED Requirements

### Requirement: Intentional registration-field configuration changes
The registration-field configuration interface SHALL require an explicit create or edit action before presenting editable field controls. Field activation changes SHALL require an explicit save or confirmation before they are persisted.

#### Scenario: Administrator views a registration field
- **WHEN** an administrator selects an existing registration field
- **THEN** its stored configuration is not immediately editable

#### Scenario: Administrator changes field activation deliberately
- **WHEN** an administrator changes a field activation state and confirms or saves the change
- **THEN** the resulting active state is persisted and governs future registration forms
