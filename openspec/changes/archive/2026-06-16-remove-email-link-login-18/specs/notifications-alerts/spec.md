## MODIFIED Requirements

### Requirement: Resend transactional emails
The system SHALL send transactional emails via the Resend API for onboarding confirmations, schedule approvals, schedule rejections, and preceptor evaluation receipts.

#### Scenario: Onboarding completion email
- **WHEN** a student completes the knowledge gate
- **THEN** Resend sends an email to the Training Major with the student's name, school, instructor, and an action link to the admin approval queue

#### Scenario: Schedule approval email
- **WHEN** an admin approves a student's shift request
- **THEN** Resend sends a confirmation email to the student with the approved date and shift type

#### Scenario: Schedule rejection email
- **WHEN** an admin rejects a student's shift request
- **THEN** Resend sends a notification email to the student with the rejected date

#### Scenario: Evaluation receipt email
- **WHEN** a student submits a clinical evaluation
- **THEN** Resend sends a confirmation receipt email to the student summarizing their submission

## REMOVED Requirements

### Requirement: Account approval and magic link email
**Reason**: Admin approval no longer sends any email — students receive credentials on the onboarding completion screen and via the Resend welcome email. The password-auth-system change (2026-06-14) removed magic link delivery from the approval flow.
**Migration**: N/A — the approval API route (`/api/admin/approve-student`) only updates status and access expiry. No email replacement is needed.
