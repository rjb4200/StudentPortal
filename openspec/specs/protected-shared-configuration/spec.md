# protected-shared-configuration

## Purpose
Protect shared student-facing configuration from unintended changes by requiring explicit edit, save, and discard actions.

## Requirements

### Requirement: Protected shared-configuration edit sessions
The system SHALL present persisted shared, student-facing configuration in a read-only state until an administrator explicitly starts an edit or create session. An edit session SHALL keep changes local until the administrator saves them and SHALL provide a discard action that restores the last persisted state.

#### Scenario: Existing configuration opens read-only
- **WHEN** an administrator opens a protected configuration section
- **THEN** its persisted values are not editable until the administrator selects an explicit edit action

#### Scenario: Administrator discards a configuration draft
- **WHEN** an administrator changes values in an active edit session and selects discard
- **THEN** the changed values are not persisted
- **AND** the section returns to its last persisted read-only values

#### Scenario: Administrator saves a configuration draft
- **WHEN** an administrator changes valid values in an active edit session and selects save
- **THEN** the system persists the changed values
- **AND** the section returns to a read-only state showing the saved values

### Requirement: Intentional shared-configuration order changes
The system SHALL keep shared configuration reorder changes local until an administrator explicitly saves the new order or discards it.

#### Scenario: Administrator changes order without saving
- **WHEN** an administrator moves an item during a reorder session but does not save the order
- **THEN** the persisted order remains unchanged

#### Scenario: Administrator saves a reordered list
- **WHEN** an administrator saves a valid reordered list
- **THEN** the system persists the list in the displayed order

#### Scenario: Administrator discards a reordered list
- **WHEN** an administrator discards a pending reordered list
- **THEN** the displayed order returns to the last persisted order
