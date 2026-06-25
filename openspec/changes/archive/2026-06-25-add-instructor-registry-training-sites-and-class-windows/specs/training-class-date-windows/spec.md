## ADDED Requirements

### Requirement: Training class records
The system SHALL store training classes with `training_site_id`, `instructor_id`, class name, `class_start_date`, `ride_time_end_date`, optional notes, status, approval metadata, and timestamps. Training classes SHALL support statuses `pending`, `active`, `rejected`, `suspended`, and `archived`.

#### Scenario: Class references site and instructor
- **WHEN** a training class is created
- **THEN** it references one training site and one instructor by foreign key
- **AND** the system can derive the class's site and instructor from the selected class id

### Requirement: Class date window visibility
The system SHALL show a training class in student-facing Site/Class options only when the class, linked instructor, and linked training site are active and the application-local current date is between `class_start_date` and `ride_time_end_date`, inclusive.

#### Scenario: Active class visible during window
- **WHEN** a class, site, and instructor are active and the current local date is on or after `class_start_date` and on or before `ride_time_end_date`
- **THEN** the class appears in student Site/Class options

#### Scenario: Future class hidden before start date
- **WHEN** a class is active but the current local date is before `class_start_date`
- **THEN** the class does not appear in student Site/Class options

#### Scenario: Expired class hidden after ride-time end
- **WHEN** a class is active but the current local date is after `ride_time_end_date`
- **THEN** the class does not appear in student Site/Class options

### Requirement: Class date range validation
The system SHALL require `ride_time_end_date` to be on or after `class_start_date` and SHALL reject obviously invalid date ranges before saving class records.

#### Scenario: Invalid class date range rejected
- **WHEN** a class submission has `ride_time_end_date` before `class_start_date`
- **THEN** the system rejects the submission with a validation error
- **AND** the invalid class record is not saved

### Requirement: Class-driven student access expiration
For new students linked to a training class, the system SHALL derive `students.access_until` from the selected class `ride_time_end_date` during admin approval.

#### Scenario: Class-linked student approved
- **WHEN** an admin approves a pending student with `training_class_id` linked to an active class
- **THEN** the student status becomes `certified`
- **AND** `students.access_until` is set from that class's `ride_time_end_date`

#### Scenario: Existing unassigned student approved
- **WHEN** an admin approves an existing compatible student without `training_class_id`
- **THEN** the student retains the existing legacy approval behavior
