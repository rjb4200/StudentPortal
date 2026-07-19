## ADDED Requirements

### Requirement: Protected MOU template editing
The system SHALL present the MOU template body as read-only until an administrator explicitly starts an edit session. The editor SHALL provide save and discard actions and SHALL state that saved template changes affect newly created MOUs only.

#### Scenario: Administrator opens MOU configuration
- **WHEN** an administrator views MOU configuration
- **THEN** the template body is not immediately editable

#### Scenario: Administrator saves a future MOU template
- **WHEN** an administrator saves a valid edited MOU template
- **THEN** the updated template is used for newly created class MOUs
- **AND** existing signed MOU body snapshots remain unchanged

#### Scenario: Administrator discards MOU template changes
- **WHEN** an administrator discards an edited MOU template before saving
- **THEN** the stored MOU template remains unchanged
