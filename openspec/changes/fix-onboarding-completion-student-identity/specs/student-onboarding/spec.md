## MODIFIED Requirements

### Requirement: Student registration form
The system SHALL present a multi-step registration form collecting full name, email, phone, school name, instructor name, and instructor contact. The onboarding route SHALL be anonymously accessible at `/onboarding` without requiring a query token. Registration SHALL preserve historical real student records by creating new enrollment rows for eligible repeat students instead of overwriting existing records.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with an email not present in an active student record from `/onboarding`
- **THEN** the student enrollment record is created with status `pending` and the workflow advances to the legal waiver step

#### Scenario: Duplicate pending email registration
- **WHEN** a student submits a registration form with an email already present on a `pending` student record
- **THEN** the system displays an error message and blocks duplicate submission

#### Scenario: Active certified email registration
- **WHEN** a student submits a registration form with an email already present on a `certified` student record
- **THEN** the system displays an error message and blocks self-registration

#### Scenario: Repeat expired or archived student registration
- **WHEN** a student submits a registration form with an email already present only on an `expired` or `archived` real student record
- **THEN** the system creates a new `pending` enrollment row linked to the prior row by `previous_student_id` and does not modify the prior row's `id` or historical fields

#### Scenario: Blacklisted student registration
- **WHEN** a student submits a registration form with an email present on a row where `is_blacklisted = true`
- **THEN** the system blocks self-registration and indicates that admin review is required

#### Scenario: Missing required fields
- **WHEN** a student submits the form with any required field empty
- **THEN** the system highlights the missing fields and blocks submission

#### Scenario: Direct onboarding access
- **WHEN** a user navigates directly to `/onboarding` without a token query parameter
- **THEN** the system displays the onboarding registration flow

#### Scenario: Self-registration does not create test records
- **WHEN** a student submits the public onboarding registration form
- **THEN** the created record has `is_test_record = false`
