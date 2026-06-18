## MODIFIED Requirements

### Requirement: Dynamic registration form rendering
The student registration form SHALL render active registration fields ordered by the configured sort order. Sort order SHALL be the sole determinant of field order — no fields SHALL be hardcoded to appear first based on field_key.

#### Scenario: Student sees configured form
- **WHEN** a student reaches the registration step
- **THEN** the form displays all active fields from the database in configured order

#### Scenario: Required field validation
- **WHEN** a student submits the form with an empty required field
- **THEN** the system displays a validation error and prevents submission

### Requirement: Admin-managed registration fields
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete registration form fields from the Admin Command Center. Full name and email are permanent mandatory anchors; all other fields are configurable. Reordering SHALL use ▲/▼ buttons with recalculation to guarantee unique sort_order values.

#### Scenario: Create registration field
- **WHEN** an admin creates a field with label, field key, field type, required flag, placeholder text, and sort order
- **THEN** the field is stored and rendered on the student registration form when active
- **AND** the new field's sort_order is set to the maximum existing sort_order plus 10

#### Scenario: Reorder registration field up
- **WHEN** an admin clicks ▲ on a registration field
- **THEN** the field swaps position with the item above it
- **AND** all fields' sort_order values are reassigned to clean multiples of 10

#### Scenario: Reorder registration field down
- **WHEN** an admin clicks ▼ on a registration field
- **THEN** the field swaps position with the item below it
- **AND** all fields' sort_order values are reassigned to clean multiples of 10

#### Scenario: Edit field label
- **WHEN** an admin changes a field's label
- **THEN** the new label appears on the student registration form without a redeploy

#### Scenario: Toggle required
- **WHEN** an admin marks a previously optional field as required
- **THEN** the student registration form validates that field before submission

#### Scenario: Deactivate field
- **WHEN** an admin deactivates a field
- **THEN** the field is hidden from future student registration forms
