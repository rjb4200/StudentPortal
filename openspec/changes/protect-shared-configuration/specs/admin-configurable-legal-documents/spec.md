## ADDED Requirements

### Requirement: Intentional legal-document configuration changes
The legal-document configuration interface SHALL require an explicit create or edit action before presenting editable legal-document fields. It SHALL require an explicit save action before a legal-document change becomes available to future onboarding sessions.

#### Scenario: Administrator views a legal document
- **WHEN** an administrator selects an existing legal document
- **THEN** its title and body are shown without immediately editable controls

#### Scenario: Administrator saves an edited legal document
- **WHEN** an administrator explicitly edits and saves a legal document
- **THEN** the changed document is used in future onboarding sessions according to its active state
