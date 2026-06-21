## Purpose

Define the student-facing onboarding flow from public registration through legal signing, resources, quiz completion, and admin notification.
## Requirements
### Requirement: Student registration form
The system SHALL present a multi-step registration form collecting full name, email, phone, school name, instructor name, and instructor contact. The onboarding route SHALL be anonymously accessible at `/onboarding` without requiring a query token. Registration SHALL preserve historical real student records by creating new enrollment rows for eligible repeat students instead of overwriting existing records. A registration-created student row SHALL have `status = 'pending'` and `onboarding_completed_at = null` until the student completes the full onboarding flow.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with an email not present in an active student record from `/onboarding`
- **THEN** the student enrollment record is created with status `pending`
- **AND** `onboarding_completed_at` is null
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
- **WHEN** a student submits the form with any required field empty
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

### Requirement: Legal waiver and HIPAA NDA signing
The system SHALL display all active legal documents one at a time in a scrollable container with individual agreement checkboxes that require scroll-to-bottom before enabling. The student SHALL enter their full legal name as an electronic signature in a dedicated signature phase that includes a summary of agreed documents, a visual signature line with date, and a legal disclaimer. Upon submission, the system SHALL send the signature request to a server-side API route that captures the real client IP address, uses server-accurate timestamps, and records per-document acceptances in a `student_legal_acceptances` table. When only one document exists, the signature block SHALL appear inline below the document.

#### Scenario: Complete legal signing with multiple documents
- **WHEN** a student scrolls through each document, checks all required agreement boxes, enters their full name in the signature phase, and submits
- **THEN** the server-side API records the real IP and server timestamp on the `students` row
- **AND** per-document acceptance records are created in `student_legal_acceptances`
- **AND** the workflow advances to the resource library

#### Scenario: Complete legal signing with single document
- **WHEN** only one active document exists, the student scrolls to the bottom, checks the agreement box, enters their full name in the inline signature block, and submits
- **THEN** the server-side API records the signature with real metadata
- **AND** the workflow advances

#### Scenario: Incomplete legal signing
- **WHEN** a student submits without entering their full name or without checking all required agreement checkboxes
- **THEN** the system blocks submission and indicates the missing required field

#### Scenario: Scroll enforcement before agreement
- **WHEN** a document is displayed and the student has not scrolled to the bottom
- **THEN** the agreement checkbox remains disabled and cannot be checked

### Requirement: Resource library downloads
The system SHALL present downloadable WFD Station Maps (Station 1 Downtown HQ, Station 2 Fulton Rd, Station 3 Fortune Dr) and Departmental SOGs. Each resource SHALL have a download button that triggers a browser file download.

#### Scenario: Downloading a station map
- **WHEN** a student clicks the download button for "Station 1 Downtown HQ Map"
- **THEN** the browser initiates a file download of the corresponding PDF or image

#### Scenario: Downloading departmental SOGs
- **WHEN** a student clicks the download button for "Departmental SOGs"
- **THEN** the browser initiates a file download of the SOG document

### Requirement: Knowledge gate safety quiz

The system SHALL present a photo-grid compliance quiz where students visually inspect photographs and tap every photo that is not in compliance with the displayed rule. Photo labels and reasons SHALL be hidden during selection and revealed only after submission. The system SHALL show slide transitions between rule, question, and feedback modes. Three or more failed attempts on a rule followed by a successful pass SHALL trigger an admin flag. If a quiz photo fails to load, the system SHALL clearly show the failed media state and SHALL prevent students from submitting an answer for that rule based on missing media.

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
- **AND** the affected photo cannot be selected
- **AND** submitting the current rule is blocked with a clear media-unavailable message

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
Upon knowledge gate completion through a verified onboarding session, the system SHALL send an email to the Training Major containing the new student's name, school, and instructor details, requesting account approval. The completion page SHALL differentiate between newly created and existing accounts, providing auto-login only for new accounts. The PIN email and PIN display SHALL remain available for newly created accounts after onboarding session proof is verified.

#### Scenario: New account onboarding complete
- **WHEN** a student with a newly created auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays the student's temporary credentials and a "Continue to Dashboard" button for client-side auto-login
- **AND** the student receives an email containing the PIN/password
- **AND** the Training Major receives an email with student details

#### Scenario: Existing account onboarding complete
- **WHEN** a student with a linked existing auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays instructions to use existing credentials and a "/login" link
- **AND** no auto-login button or temporary credentials are shown
- **AND** the Training Major receives an email with student details

#### Scenario: Completion rejected without matching session proof
- **WHEN** a caller attempts to finish onboarding for a student id without matching onboarding session proof
- **THEN** no PIN/password is generated, no completion notification is sent, and the student sees a clear session verification error

### Requirement: Onboarding Progress Indicator

The system SHALL display an onboarding progress indicator that represents the full student onboarding flow, including Register, Legal, Resources, Review, and Complete.

#### Scenario: Completion step is represented

- **WHEN** a student reaches the final onboarding completion screen
- **THEN** the progress indicator shows step 5 of 5
- **AND** the current step label is `Complete`

