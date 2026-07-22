# Class Level

## Purpose
TBD

## Requirements

### Requirement: Training class certification level
The `training_classes` table SHALL include a `level` column of type `text` constrained to the following values in display order: `'First Responder'`, `'EMT'`, `'AEMT'`, `'Paramedic'`, `'Critical Care'`, `'Community Paramedic'`, `'Wilderness Paramedic'`. The column SHALL be nullable; existing rows without a level SHALL have `level = null` until manually updated by an administrator.

#### Scenario: Class is created with a level
- **WHEN** an administrator creates a new training class and selects a certification level from the dropdown
- **THEN** the class row stores the selected level value

#### Scenario: Class is created without a level
- **WHEN** an administrator creates a training class without selecting a level
- **THEN** the class row stores `level = null` and displays without a level suffix

#### Scenario: Invalid level value is rejected
- **WHEN** an insert or update attempts to set `level` to a value not in the constraint list
- **THEN** the database rejects the operation with a constraint violation error

### Requirement: Level displayed in class dropdown labels
The system SHALL append the certification level to class display labels as a bracketed suffix when the level is not null. The format SHALL be `"Site Name - Class Name [Level]"`. When level is null, no suffix SHALL be appended.

#### Scenario: Class with level in registration dropdown
- **WHEN** the registration form loads class options and a class has `level = 'EMT'`
- **THEN** the dropdown option displays as `"Station 1 - Summer EMT [EMT]"`

#### Scenario: Class without level in registration dropdown
- **WHEN** the registration form loads class options and a class has `level = null`
- **THEN** the dropdown option displays as `"Station 1 - Summer EMT"` without a bracketed suffix

#### Scenario: Level displayed in admin class list
- **WHEN** an administrator views the Classes table in the Registry tab
- **THEN** each class row displays its level alongside the class name

### Requirement: Level displayed in admin student views
The system SHALL display the certification level for each student by joining through `training_class_id` to `training_classes.level`. The level SHALL appear in the Daily Operations student roster, the pending-approval list, and the student detail profile page.

#### Scenario: Student roster shows level
- **WHEN** an administrator views the Daily Operations student roster and a student is associated with a class that has `level = 'Paramedic'`
- **THEN** the student's class label includes or is accompanied by `[Paramedic]`

#### Scenario: Student with unleveled class in roster
- **WHEN** an administrator views the roster and a student's class has `level = null`
- **THEN** the student's class label displays without a level suffix

#### Scenario: Student detail profile shows level
- **WHEN** an administrator views a student's profile at `/admin/students/<id>` and the student's class has a level
- **THEN** the training class section or fact grid displays the level

#### Scenario: Pending approval list shows level
- **WHEN** an administrator views the Action Required approvals list and a pending student's class has a level
- **THEN** the student row displays the level alongside the class name
