# admin-configurable-registration-fields

**Purpose:** Allow training staff to manage the student registration form fields (add, remove, reorder, rename, toggle required, set field types) from the Admin Command Center without code changes.

## Requirements

### Requirement: Admin-managed registration fields
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete registration form fields from the Admin Command Center. Full name and email are permanent mandatory anchors; all other fields are configurable.

#### Scenario: Create registration field
- **WHEN** an admin creates a field with label, field key, field type, required flag, placeholder text, and sort order
- **THEN** the field is stored and rendered on the student registration form when active

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
The student registration form SHALL render active registration fields ordered by the configured sort order, with full name and email always present first.

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
