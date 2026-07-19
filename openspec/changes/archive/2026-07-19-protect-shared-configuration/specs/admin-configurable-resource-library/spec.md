## ADDED Requirements

### Requirement: Intentional resource-library configuration changes
The resource-library configuration interface SHALL require an explicit create or edit action before presenting editable category or document controls. It SHALL require an explicit save action before a category or document change becomes available to future student resource-library views.

#### Scenario: Administrator views a resource category or document
- **WHEN** an administrator selects an existing resource category or document
- **THEN** its stored configuration is not immediately editable

#### Scenario: Administrator saves resource-library configuration
- **WHEN** an administrator explicitly edits and saves a valid resource category or document
- **THEN** the change is persisted and applies to future resource-library views according to its active state
