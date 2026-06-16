## Purpose

Define the student-facing onboarding flow from public registration through legal signing, resources, quiz completion, and admin notification.
## Requirements
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

### Requirement: Legal waiver and HIPAA NDA signing
The system SHALL display the WFD Observer Liability Waiver and institutional HIPAA NDA in a scrollable container. The student SHALL enter their full legal name and check a validation checkbox. Upon submission, the system SHALL capture the student's IP address and timestamp as their legal signature.

#### Scenario: Complete legal signing
- **WHEN** a student scrolls through both documents, enters their full name, checks the agreement checkbox, and submits
- **THEN** the `legal_signature`, `signature_ip`, and `signature_timestamp` fields are populated and the workflow advances to the resource library

#### Scenario: Incomplete legal signing
- **WHEN** a student submits without entering their full name or without checking the agreement checkbox
- **THEN** the system blocks submission and indicates the missing required field

### Requirement: Resource library downloads
The system SHALL present downloadable WFD Station Maps (Station 1 Downtown HQ, Station 2 Fulton Rd, Station 3 Fortune Dr) and Departmental SOGs. Each resource SHALL have a download button that triggers a browser file download.

#### Scenario: Downloading a station map
- **WHEN** a student clicks the download button for "Station 1 Downtown HQ Map"
- **THEN** the browser initiates a file download of the corresponding PDF or image

#### Scenario: Downloading departmental SOGs
- **WHEN** a student clicks the download button for "Departmental SOGs"
- **THEN** the browser initiates a file download of the SOG document

### Requirement: Knowledge gate safety quiz
The system SHALL present a photo-grid compliance quiz where students visually inspect photographs and tap every photo that is not in compliance with the displayed rule. Photo labels and reasons SHALL be hidden during selection and revealed only after submission. The system SHALL show slide transitions between rule, question, and feedback modes. Three or more failed attempts on a rule followed by a successful pass SHALL trigger an admin flag.

#### Scenario: Correct photo selection
- **WHEN** a student correctly selects all non-compliant photos for a rule based on visual inspection alone
- **THEN** the system displays a "Correct!" success indicator and advances to the next rule or completion

#### Scenario: Incorrect photo selection
- **WHEN** a student submits an incorrect photo selection
- **THEN** the system displays a persistent feedback panel showing per-photo results with labels and reasons
- **AND** the feedback panel does not auto-dismiss

#### Scenario: Image load failure
- **WHEN** a quiz photo image fails to load
- **THEN** the system displays a branded fallback placeholder instead of a broken image icon
- **AND** the quiz remains functional

#### Scenario: Knowledge gate completion
- **WHEN** a student correctly completes all quiz rules
- **THEN** the system presents the completion screen and allows the student to finish onboarding

### Requirement: Image grid quiz for acceptable/unacceptable actions
The system SHALL present a grid of photos for each rule where students visually identify non-compliant images. Photo labels and reasons SHALL be hidden during the selection phase and revealed only in the feedback panel after submission.

#### Scenario: Correct image classification
- **WHEN** a student correctly identifies all non-compliant photos in the grid by visual inspection
- **THEN** the system displays a success micro-feedback and advances past this rule

#### Scenario: Incorrect image classification
- **WHEN** a student submits classifications with incorrect answers
- **THEN** the system displays a persistent feedback panel showing missed and incorrect selections with per-photo labels and reasons
- **AND** the student may choose to review the rule or retry

### Requirement: Post-onboarding notification
Upon knowledge gate completion, the system SHALL send an email to the Training Major containing the new student's name, school, and instructor details, requesting account approval. The completion page SHALL differentiate between newly created and existing accounts, providing auto-login only for new accounts.

#### Scenario: New account onboarding complete
- **WHEN** a student with a newly created auth account completes the knowledge gate
- **THEN** the completion page displays the student's temporary credentials and a "Continue to Dashboard" button for client-side auto-login
- **AND** the Training Major receives an email with student details

#### Scenario: Existing account onboarding complete
- **WHEN** a student with a linked existing auth account completes the knowledge gate
- **THEN** the completion page displays instructions to use existing credentials and a "/login" link
- **AND** no auto-login button or temporary credentials are shown
- **AND** the Training Major receives an email with student details

