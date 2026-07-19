# admin-configurable-registration-fields

## Purpose
Allow training staff to manage the student registration form fields (add, remove, reorder, rename, toggle required, set field types) from the Admin Command Center without code changes.
## Requirements

### Requirement: Intentional registration-field configuration changes
The registration-field configuration interface SHALL require an explicit create or edit action before presenting editable field controls. Field activation changes SHALL require an explicit save or confirmation before they are persisted.

#### Scenario: Administrator views a registration field
- **WHEN** an administrator selects an existing registration field
- **THEN** its stored configuration is not immediately editable

#### Scenario: Administrator changes field activation deliberately
- **WHEN** an administrator changes a field activation state and confirms or saves the change
- **THEN** the resulting active state is persisted and governs future registration forms

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

### Requirement: Dynamic registration form rendering
The student registration form SHALL render active registration fields ordered by the configured sort order. Sort order SHALL be the sole determinant of field order — no fields SHALL be hardcoded to appear first based on field_key.

#### Scenario: Student sees configured form
- **WHEN** a student reaches the registration step
- **THEN** the form displays all active fields from the database in configured order, starting with name and email

#### Scenario: Required field validation
- **WHEN** a student submits the form with an empty required field
- **THEN** the system displays a validation error and prevents submission

### Requirement: Registration field type support
The system SHALL support text, email, tel, textarea, and select field types for registration fields.

#### Scenario: Select field with options
- **WHEN** an admin creates a select field with comma-separated options
- **THEN** the student registration form renders a dropdown with those options

#### Scenario: Textarea field
- **WHEN** an admin creates a textarea field
- **THEN** the student registration form renders a multi-line text input

### Requirement: Registration field type rendering

The registration form SHALL render fields according to their configured `field_type`. Fields with `field_type='email'` SHALL render as `<input type="email">` with `autoComplete="email"`. Fields with `field_type='tel'` SHALL render as `<input type="tel">` with `autoComplete="tel"`. Fields with `field_type='select'` SHALL render as a `<select>` dropdown. Fields with `field_type='textarea'` SHALL render as a `<textarea>`. All other field types SHALL render as `<input type="text">`.

#### Scenario: Email field renders as email input

- **WHEN** a registration field is configured with `field_type='email'`
- **THEN** the HTML input renders with `type="email"` and `autoComplete="email"`

#### Scenario: Unknown field type falls back to text

- **WHEN** a registration field has an unrecognized `field_type`
- **THEN** the HTML input renders as `type="text"`
