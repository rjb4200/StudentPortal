## MODIFIED Requirements

### Requirement: Student registration form
The system SHALL present a dynamically-configured registration form on the first step of the onboarding wizard, collecting fields defined in the `registration_fields` table. The onboarding route SHALL be anonymously accessible at `/onboarding`. Registration SHALL preserve historical real student records by creating new enrollment rows for eligible repeat students instead of overwriting existing records.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with an email not present in an active student record from `/onboarding`
- **THEN** the student enrollment record is created with status `pending` and the wizard advances to the legal waiver step

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

#### Scenario: Self-registration does not create test records
- **WHEN** a student submits the public onboarding registration form
- **THEN** the created record has `is_test_record = false`

### Requirement: Legal waiver and agreement signing
The system SHALL display active legal documents from the `legal_documents` table in scrollable containers. The student SHALL check required agreement checkboxes and enter their full legal name as signature. Upon submission, the system SHALL capture the student's IP address and timestamp as their legal signature.

#### Scenario: Complete legal signing
- **WHEN** a student checks all required agreement checkboxes, enters their full name, and submits
- **THEN** the `legal_signature`, `signature_ip`, and `signature_timestamp` fields are populated and the wizard advances to the resource library

#### Scenario: Incomplete legal signing
- **WHEN** a student submits without checking all required checkboxes or without entering their full name
- **THEN** the system blocks submission and indicates the missing required field

#### Scenario: No legal documents required
- **WHEN** no active legal documents with `require_checkbox = true` exist
- **THEN** the system displays an informational notice and allows the student to proceed with signature alone

### Requirement: Resource library downloads
The system SHALL present downloadable resource documents organized by active categories from the `resource_categories` and `resource_documents` tables. Each resource SHALL have a clickable card that opens the file in a new tab or triggers a browser download.

#### Scenario: Downloading a resource document
- **WHEN** a student clicks a resource document card
- **THEN** the browser opens the document URL in a new tab or initiates a file download

#### Scenario: No resources available
- **WHEN** no active resource categories with active documents exist
- **THEN** the system displays an informational notice and allows the student to proceed

### Requirement: Knowledge gate rule-by-rule photo quiz
The system SHALL present active quiz rules from the `quiz_rules` table with their associated active photos from `quiz_photos`. For each rule, the student SHALL identify all non-compliant photos from a grid. The student SHALL pass each rule before advancing to the next. Upon completion of all rules, the system SHALL call the onboarding-complete notification API and display a temporary password and email to the student.

#### Scenario: Student correctly identifies non-compliant photos
- **WHEN** a student selects all photos marked `is_non_compliant = true` for a rule
- **THEN** the system marks the rule as passed and advances to the next rule

#### Scenario: Student misses a non-compliant photo
- **WHEN** a student submits selections that do not include all non-compliant photos
- **THEN** the system highlights missed photos, shows the reason text, and requires a retry of that rule

#### Scenario: Student selects a compliant photo incorrectly
- **WHEN** a student selects a photo with `is_non_compliant = false`
- **THEN** the system indicates the incorrect selection and requires correction before passing

#### Scenario: Rule has insufficient photos
- **WHEN** an active rule has fewer than 4 active photos
- **THEN** the rule is excluded from the quiz and the student is not tested on it

#### Scenario: Knowledge gate completion
- **WHEN** a student passes all eligible quiz rules
- **THEN** the `POST /api/notify/onboarding-complete` endpoint is called, a temporary password is generated, and the student's `auth_user_id` is linked

### Requirement: Post-onboarding notification and completion screen
Upon knowledge gate completion, the system SHALL display a completion screen with the active completion message template from `message_templates` (type `completion`), show the student's temporary credentials in a highlighted box, and send admin notifications. The student record SHALL remain in `pending` status awaiting admin approval.

#### Scenario: Completion screen with credentials displayed
- **WHEN** a student completes the knowledge gate
- **THEN** the completion screen displays the message template content, the student's email, and the generated temporary password in a highlighted credentials box

#### Scenario: Completion screen with existing credentials
- **WHEN** a student who already has an auth user completes the knowledge gate
- **THEN** the completion screen displays a message indicating the student should use their existing WFD credentials

#### Scenario: Admin notification on completion
- **WHEN** a student completes the knowledge gate
- **THEN** a Pushover notification is sent to administrators and an email notification is sent to admin accounts with `notify_onboarding_complete = true`

## REMOVED Requirements

### Requirement: Knowledge gate safety quiz
**Reason**: The hotspot/click-zone quiz was replaced by the rule-by-rule photo selection quiz in `knowledge-gate.tsx`. The legacy hotspot, image-grid, and MCQ quiz components (`hotspot-quiz.tsx`, `image-grid-quiz.tsx`, `mcq-section.tsx`) are dead code with no active imports.
**Migration**: No migration needed. The photo-selection quiz in `knowledge-gate.tsx` has been the active implementation. The legacy components are being deleted as part of this change.

### Requirement: Image grid quiz for acceptable/unacceptable actions
**Reason**: Merged into the rule-by-rule photo selection quiz. Each rule's photos can be classified as compliant or non-compliant within the unified quiz interface rather than in a separate grid quiz step.
**Migration**: No migration needed. The `knowledge-gate.tsx` component handles both the rule display and the photo compliance selection in a single integrated interface.
