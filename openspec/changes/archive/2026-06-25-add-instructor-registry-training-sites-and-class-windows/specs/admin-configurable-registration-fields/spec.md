## ADDED Requirements

### Requirement: System-managed Site/Class registration field
The student registration form SHALL render the Site/Class selection as a system-managed required field rather than as a free-form configurable registration field. Admin-configurable registration fields SHALL continue to render around the system-managed field without being responsible for storing training class relationships.

#### Scenario: Site/Class is not a comma-option select field
- **WHEN** the student registration form renders the Site/Class selection
- **THEN** options come from approved visible training classes
- **AND** the field stores the selected class relationship ids instead of a comma-separated text option

#### Scenario: Configurable custom fields still render
- **WHEN** admins have active custom registration fields configured
- **THEN** the student registration form renders those fields according to their configured order and type in addition to the required Site/Class selection
