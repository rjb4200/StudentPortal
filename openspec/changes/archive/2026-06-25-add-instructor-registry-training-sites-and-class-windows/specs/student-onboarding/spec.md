## MODIFIED Requirements

### Requirement: Student registration form
The system SHALL present a multi-step registration form collecting full name, email, phone, and one required approved Site/Class selection for new registrations. The onboarding route SHALL be anonymously accessible at `/onboarding` without requiring a query token. Registration SHALL preserve historical real student records by creating new enrollment rows for eligible repeat students instead of overwriting existing records. A registration-created student row SHALL have `status = 'pending'` and `onboarding_completed_at = null` until the student completes the full onboarding flow. For class-linked registrations, the selected Site/Class SHALL save `training_class_id`, `training_site_id`, and `instructor_id` on the student row and MAY populate legacy school/instructor text fields for compatibility.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with an email not present in an active student record from `/onboarding` and selects a visible approved Site/Class
- **THEN** the student enrollment record is created with status `pending`
- **AND** `onboarding_completed_at` is null
- **AND** the selected `training_class_id`, `training_site_id`, and `instructor_id` are saved
- **AND** the workflow advances to the legal waiver step

#### Scenario: Duplicate pending email registration
- **WHEN** a student submits a registration form with an email already present on a `pending` student record
- **THEN** the system displays an error message and blocks duplicate submission

#### Scenario: Active certified email registration
- **WHEN** a student submits a registration form with an email already present on a `certified` student record
- **THEN** the system displays an error message and blocks self-registration

#### Scenario: Repeat expired or archived student registration
- **WHEN** a student submits a registration form with an email already present only on an `expired` or `archived` real student record
- **THEN** the system creates a new `pending` enrollment row linked to the prior row by `previous_student_id` and does not modify the prior row's `id` or historical fields
- **AND** the new enrollment row has `onboarding_completed_at = null`

#### Scenario: Blacklisted student registration
- **WHEN** a student submits a registration form with an email present on a row where `is_blacklisted = true`
- **THEN** the system blocks self-registration and indicates that admin review is required

#### Scenario: Missing required fields
- **WHEN** a student submits the form with any required field empty, including the Site/Class selection
- **THEN** the system highlights the missing fields and blocks submission

#### Scenario: Direct onboarding access
- **WHEN** a user navigates directly to `/onboarding` without a token query parameter
- **THEN** the system displays the onboarding registration flow

#### Scenario: Self-registration does not create test records
- **WHEN** a student submits the public onboarding registration form
- **THEN** the created record has `is_test_record = false`

#### Scenario: Incomplete registration is not approval-ready
- **WHEN** a student has submitted registration but has not completed the full onboarding flow
- **THEN** the student row remains `pending` with `onboarding_completed_at = null`
- **AND** the row is not treated as ready for admin approval

#### Scenario: No visible classes available
- **WHEN** no approved active classes are currently inside their visible date window
- **THEN** the registration form blocks student registration with a clear message to contact training staff or their instructor

### Requirement: Post-onboarding notification
Upon knowledge gate completion through a verified onboarding session, the system SHALL send an email to the Training Major containing the new student's name, selected class, site, and instructor details when available, requesting account approval. The completion page SHALL differentiate between newly created and existing accounts, providing auto-login only for new accounts. The PIN email and PIN display SHALL remain available for newly created accounts after onboarding session proof is verified.

#### Scenario: New account onboarding complete
- **WHEN** a student with a newly created auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays the student's temporary credentials and a "Continue to Dashboard" button for client-side auto-login
- **AND** the student receives an email containing the PIN/password
- **AND** the Training Major receives an email with student details and selected class context when available

#### Scenario: Existing account onboarding complete
- **WHEN** a student with a linked existing auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays instructions to use existing credentials and a "/login" link
- **AND** no auto-login button or temporary credentials are shown
- **AND** the Training Major receives an email with student details and selected class context when available

#### Scenario: Completion rejected without matching session proof
- **WHEN** a caller attempts to finish onboarding for a student id without matching onboarding session proof
- **THEN** no PIN/password is generated, no completion notification is sent, and the student sees a clear session verification error
