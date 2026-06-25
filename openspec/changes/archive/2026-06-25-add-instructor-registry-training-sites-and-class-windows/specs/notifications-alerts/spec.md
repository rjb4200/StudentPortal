## MODIFIED Requirements

### Requirement: Resend transactional emails
The system SHALL send transactional emails via the Resend API for onboarding confirmations, schedule approvals, schedule rejections, and preceptor evaluation receipts. All student-facing emails SHALL use the WFD-branded HTML template with crimson `#A40104` for header background, CTA buttons, and branded color elements. Onboarding/admin notifications SHALL include selected class, site, and instructor details when available and SHALL fall back to legacy student fields for existing unassigned students.

#### Scenario: Onboarding completion email
- **WHEN** a student completes the knowledge gate after selecting a Site/Class during registration
- **THEN** Resend sends an email to the Training Major with the student's name, selected site, selected class, instructor details, and an action link to the admin approval queue

#### Scenario: Legacy onboarding completion email
- **WHEN** an existing compatible student without class assignment completes onboarding
- **THEN** Resend sends an email to the Training Major using the available legacy school and instructor fields

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
