## MODIFIED Requirements

### Requirement: Server-side legal signature capture
The system SHALL provide a server-side API route `POST /api/onboarding/legal-signature` that accepts `studentId`, `fullName`, `agreedDocumentIds`, and `onboardingToken`. The route SHALL verify the `onboardingToken` against the student's active onboarding session before recording signatures. The route SHALL capture the real client IP address from the `x-forwarded-for` request header, use server-time for the timestamp, and SHALL NOT rely on client-supplied IP or timestamp values.

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

#### Scenario: Onboarding token required
- **WHEN** a student submits their legal signature
- **THEN** the API route verifies the `onboardingToken` against the student's active `onboarding_sessions` record using `hashOnboardingToken()`
- **AND** if the session does not exist, is expired, or is already completed, the route returns 403

#### Scenario: Rejected without valid token
- **WHEN** a caller submits a legal signature with an invalid or missing `onboardingToken`
- **THEN** the API route returns 403 with a message directing the student to restart registration

### Requirement: student_legal_acceptances table
The system SHALL maintain a `student_legal_acceptances` table with columns `id` (uuid PK), `student_id` (FK to students), `document_id` (FK to legal_documents), and `accepted_at` (timestamptz). The table SHALL enforce uniqueness on `(student_id, document_id)` and cascade deletes when students or documents are removed. The table SHALL have Row Level Security enabled to block direct PostgREST access; all writes SHALL go through the server-side API route using the admin client.

#### Scenario: RLS enabled on student_legal_acceptances
- **WHEN** a direct PostgREST query is made against `student_legal_acceptances` via the anon or authenticated role
- **THEN** the query returns no rows because RLS is enabled with no permissive policies
- **AND** the server-side API route continues to write via the service role

#### Scenario: Cascade delete on student removal
- **WHEN** a student row is deleted
- **THEN** all associated acceptance records are deleted via cascade

#### Scenario: Cascade delete on document removal
- **WHEN** a legal document is deleted
- **THEN** all acceptance records for that document are deleted via cascade
