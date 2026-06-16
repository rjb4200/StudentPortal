## MODIFIED Requirements

### Requirement: Resend transactional emails
The system SHALL send transactional emails via the Resend API for onboarding confirmations, schedule approvals, schedule rejections, and preceptor evaluation receipts. All student-facing emails SHALL use the WFD-branded HTML template with crimson `#A40104` for header background, CTA buttons, and branded color elements.

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

#### Scenario: Account approved email
- **WHEN** an admin approves a pending student
- **THEN** Resend sends a WFD-branded email to the student notifying them their account is active with a link to `/login`
