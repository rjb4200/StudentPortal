## MODIFIED Requirements

### Requirement: Legal waiver and HIPAA NDA signing
The system SHALL display all active legal documents one at a time in a scrollable container with individual agreement checkboxes that require scroll-to-bottom before enabling. The student SHALL enter their full legal name as an electronic signature in a dedicated signature phase that includes a summary of agreed documents, a visual signature line with date, and a legal disclaimer. Upon submission, the system SHALL send the signature request to a server-side API route that captures the real client IP address, uses server-accurate timestamps, and records per-document acceptances in a `student_legal_acceptances` table. When only one document exists, the signature block SHALL appear inline below the document.

#### Scenario: Complete legal signing with multiple documents
- **WHEN** a student scrolls through each document, checks all required agreement boxes, enters their full name in the signature phase, and submits
- **THEN** the server-side API records the real IP and server timestamp on the `students` row
- **AND** per-document acceptance records are created in `student_legal_acceptances`
- **AND** the workflow advances directly to the Policy and Protocol Review quiz

#### Scenario: Complete legal signing with single document
- **WHEN** only one active document exists, the student scrolls to the bottom, checks the agreement box, enters their full name in the inline signature block, and submits
- **THEN** the server-side API records the signature with real metadata
- **AND** the workflow advances directly to the Policy and Protocol Review quiz

#### Scenario: Incomplete legal signing
- **WHEN** a student submits without entering their full name or without checking all required agreement checkboxes
- **THEN** the system blocks submission and indicates the missing required field

#### Scenario: Scroll enforcement before agreement
- **WHEN** a document is displayed and the student has not scrolled to the bottom
- **THEN** the agreement checkbox remains disabled and cannot be checked

### Requirement: Onboarding Progress Indicator
The system SHALL display an onboarding progress indicator that represents the full student onboarding flow: Register, Legal, Review, and Submitted.

#### Scenario: Review step is represented
- **WHEN** a student completes legal signing
- **THEN** the progress indicator advances to step 3 of 4 labelled `Review`

#### Scenario: Completion step is represented
- **WHEN** a student reaches the final onboarding completion screen
- **THEN** the progress indicator shows step 4 of 4
- **AND** the current step label is `Submitted`
