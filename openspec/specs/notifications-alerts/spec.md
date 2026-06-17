## Purpose

Transactional email notifications, iCal feeds, and email delivery handling.
## Requirements
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

### Requirement: Per-student iCal feed generation
The system SHALL generate an iCal (`.ics`) subscription URL unique to each student. The feed SHALL list all scheduled dates: pending days SHALL appear with pending-style event properties and approved days SHALL appear with confirmed event properties. The feed SHALL update when schedule statuses change.

#### Scenario: Initial iCal feed for new student
- **WHEN** a student's first schedule request is created
- **THEN** a unique iCal feed URL is generated for that student containing all scheduled dates with appropriate pending/approved event status

#### Scenario: iCal feed updates on status change
- **WHEN** an admin approves or rejects a schedule request
- **THEN** the student's iCal feed is regenerated to reflect the updated status, and Google Calendar/Apple Calendar clients reflect the change on their next poll

### Requirement: Aggregate iCal feed for admin and preceptors
The system SHALL generate an aggregate iCal feed URL that lists all scheduled shifts for all active students, with each event displaying the student name and shift type. This feed SHALL be shareable with preceptors.

#### Scenario: Admin views aggregate calendar
- **WHEN** an admin or preceptor subscribes to the aggregate iCal feed URL in Google Calendar or Apple Calendar
- **THEN** all students' approved shifts appear as calendar events labeled with the student's name and shift type

#### Scenario: Preceptor receives aggregate feed link
- **WHEN** an admin shares the aggregate iCal feed URL with a preceptor
- **THEN** the preceptor can subscribe and view all student shifts without requiring a login

### Requirement: Email delivery failure handling
If a Resend email delivery fails, the system SHALL log the failure and retry up to 3 times with exponential backoff before marking the delivery as permanently failed.

#### Scenario: Email retry on failure
- **WHEN** a Resend API call returns a non-2xx status
- **THEN** the system retries the delivery up to 3 times with increasing delays before logging a permanent failure
