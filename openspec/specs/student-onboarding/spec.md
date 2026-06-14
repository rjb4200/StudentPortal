## ADDED Requirements

### Requirement: Student registration form
The system SHALL present a multi-step registration form collecting full name, email, phone, school name, instructor name, and instructor contact. The email field SHALL be validated for uniqueness against the students table. The onboarding route SHALL be anonymously accessible at `/onboarding` without requiring a query token.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with a unique email from `/onboarding`
- **THEN** the student record is created with status `pending` and the workflow advances to the legal waiver step

#### Scenario: Duplicate email registration
- **WHEN** a student submits a registration form with an email already present in the students table
- **THEN** the system displays an error message and blocks submission

#### Scenario: Missing required fields
- **WHEN** a student submits the form with any required field empty
- **THEN** the system highlights the missing fields and blocks submission

#### Scenario: Direct onboarding access
- **WHEN** a user navigates directly to `/onboarding` without a token query parameter
- **THEN** the system displays the onboarding registration flow

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
The system SHALL present a slide deck with interspersed safety quizzes including hotspot image testing. The student SHALL click defined zones on scene photographs to identify safety hazards, improper PPE, and apparatus positioning errors. Three cumulative failures SHALL reset progress to slide 1. Completion of all slides SHALL set `is_certified = true` on the student record.

#### Scenario: Correct hotspot identification
- **WHEN** a student clicks within the defined zone boundary of a safety hazard in a scene photograph
- **THEN** the system marks the answer correct and advances to the next slide

#### Scenario: Incorrect hotspot identification
- **WHEN** a student clicks outside all defined zone boundaries on a scene photograph
- **THEN** the system increments the failure counter and displays the remaining strikes

#### Scenario: Three failures trigger reset
- **WHEN** a student accumulates three incorrect answers across the knowledge gate
- **THEN** the system resets progress to slide 1 and clears the failure counter

#### Scenario: Knowledge gate completion
- **WHEN** a student correctly completes all quiz slides
- **THEN** the `is_certified` field is set to `true`, a Pushover notification is sent to the Training Major, and an email notification is dispatched

### Requirement: Image grid quiz for acceptable/unacceptable actions
The system SHALL present a grid of images depicting safety scenarios. The student SHALL click each image to toggle between acceptable and unacceptable classifications. All images SHALL be correctly classified to pass.

#### Scenario: Correct image classification
- **WHEN** a student correctly classifies all images in the grid as acceptable or unacceptable
- **THEN** the system advances past this quiz section

#### Scenario: Incorrect image classification
- **WHEN** a student submits classifications with incorrect answers
- **THEN** the system highlights incorrect answers, increments the failure counter, and allows retry

### Requirement: Post-onboarding notification
Upon knowledge gate completion, the system SHALL send an email to the Training Major containing the new student's name, school, and instructor details, requesting account approval.

#### Scenario: Admin notification sent
- **WHEN** a student completes the knowledge gate
- **THEN** the Training Major receives an email with student details and an approval action link
