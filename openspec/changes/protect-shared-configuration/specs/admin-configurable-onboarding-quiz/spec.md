## ADDED Requirements

### Requirement: Intentional quiz configuration changes
The quiz configuration interface SHALL require an explicit create or edit action before presenting editable rule or answer-option fields. It SHALL require an explicit save action before a rule, option, or activation-state change becomes available to future onboarding sessions.

#### Scenario: Administrator views quiz configuration
- **WHEN** an administrator selects an existing quiz rule or answer option
- **THEN** its stored configuration is not immediately editable

#### Scenario: Administrator saves quiz configuration
- **WHEN** an administrator explicitly edits valid quiz configuration and saves it
- **THEN** the change is persisted and applies to future onboarding quiz sessions according to its active state
