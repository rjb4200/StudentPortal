## MODIFIED Requirements

### Requirement: Legal waiver and HIPAA NDA signing
The system SHALL display all active legal documents in a scrollable container with individual agreement checkboxes. The student SHALL enter their full legal name as an electronic signature. Upon submission, the system SHALL send the signature request to a server-side API route that captures the real client IP address, uses server-accurate timestamps, and records per-document acceptances in a `student_legal_acceptances` table. The `legal_signature`, `signature_ip`, and `signature_timestamp` fields on the `students` row SHALL be populated with real values captured server-side.

#### Scenario: Complete legal signing
- **WHEN** a student checks all required document agreement boxes, enters their full name, and submits
- **THEN** the server-side API records the real IP and server timestamp on the `students` row
- **AND** per-document acceptance records are created in `student_legal_acceptances`
- **AND** the workflow advances to the resource library

#### Scenario: Incomplete legal signing
- **WHEN** a student submits without entering their full name or without checking all required agreement checkboxes
- **THEN** the system blocks submission and indicates the missing required field
