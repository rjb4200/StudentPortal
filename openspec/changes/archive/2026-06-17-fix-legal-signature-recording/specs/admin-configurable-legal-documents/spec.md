## MODIFIED Requirements

### Requirement: Legal document signature
The system SHALL require the student to type their full legal name as an electronic signature before advancing past the legal step. The signature SHALL be captured server-side with real IP address and server-accurate timestamp. Each active document the student agreed to SHALL be recorded as an individual acceptance in a `student_legal_acceptances` table.

#### Scenario: Missing signature
- **WHEN** a student attempts to advance without typing their full legal name
- **THEN** the system displays a validation error and prevents advancement

#### Scenario: Signature recorded with real metadata
- **WHEN** a student completes the legal step
- **THEN** the student's IP address is captured from the request headers and stored in `signature_ip`
- **AND** the acceptance timestamp is the server's current time
- **AND** a row in `student_legal_acceptances` is created for each document the student agreed to
