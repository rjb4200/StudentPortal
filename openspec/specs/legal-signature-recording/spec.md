# legal-signature-recording Specification

## Purpose
Server-side legal signature capture with real IP detection, server-accurate timestamps, and per-document acceptance tracking via a `student_legal_acceptances` junction table.

## Requirements
### Requirement: Server-side legal signature capture
The system SHALL provide a server-side API route `POST /api/onboarding/legal-signature` that accepts `studentId`, `fullName`, and `agreedDocumentIds`. The route SHALL capture the real client IP address from the `x-forwarded-for` request header, use server-time for the timestamp, and SHALL NOT rely on client-supplied IP or timestamp values.

#### Scenario: Real IP captured from x-forwarded-for
- **WHEN** a student submits their legal signature and the request includes an `x-forwarded-for` header
- **THEN** the API route extracts the first IP from the header and stores it in `signature_ip`
- **AND** the API route stores the server's current time in `signature_timestamp`

#### Scenario: Fallback when no x-forwarded-for header
- **WHEN** a student submits their legal signature and no `x-forwarded-for` or `x-real-ip` header is present
- **THEN** the API route stores `0.0.0.0` as the fallback IP

#### Scenario: Server timestamp used
- **WHEN** a student submits their legal signature
- **THEN** the stored `signature_timestamp` is the server's `new Date().toISOString()`, not the client's system clock

### Requirement: Per-document acceptance recording
The system SHALL record which specific legal documents a student accepted in a `student_legal_acceptances` table. Each row SHALL link a student to a document with the acceptance timestamp. The system SHALL NOT lose per-document acceptance data after submission.

#### Scenario: Multiple documents accepted
- **WHEN** a student agrees to two active legal documents and submits their signature
- **THEN** two rows are inserted into `student_legal_acceptances`, each linking the student to a distinct document

#### Scenario: Re-registration creates fresh acceptance records
- **WHEN** a student re-registers (new `students.id`) and completes the legal step
- **THEN** acceptance records are created for the new student row, independent of prior acceptances on the old row

### Requirement: student_legal_acceptances table
The system SHALL maintain a `student_legal_acceptances` table with columns `id` (uuid PK), `student_id` (FK to students), `document_id` (FK to legal_documents), and `accepted_at` (timestamptz). The table SHALL enforce uniqueness on `(student_id, document_id)` and cascade deletes when students or documents are removed.

#### Scenario: Cascade delete on student removal
- **WHEN** a student row is deleted
- **THEN** all associated acceptance records are deleted via cascade

#### Scenario: Cascade delete on document removal
- **WHEN** a legal document is deleted
- **THEN** all acceptance records for that document are deleted via cascade
