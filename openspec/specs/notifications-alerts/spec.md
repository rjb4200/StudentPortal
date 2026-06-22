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

### Requirement: Protected SMS processing job
The system SHALL provide a protected server-side job that processes due SMS notification queue records. The job SHALL require the configured cron secret or equivalent server-side authorization before sending any SMS messages.

#### Scenario: Authorized SMS job processes due records
- **WHEN** the SMS processing job is called with valid cron authorization
- **THEN** the system processes pending SMS records with `send_at` at or before the current time
- **AND** each processed record is marked sent or failed based on the Twilio result

#### Scenario: Unauthorized SMS job request
- **WHEN** the SMS processing job is called without valid cron authorization
- **THEN** the system returns an unauthorized response
- **AND** no SMS records are processed

### Requirement: Daily shift reminder SMS delivery
The system SHALL deliver day-before SMS reminders for approved shifts from queued reminder records using the protected SMS processing job.

#### Scenario: Reminder due for approved shift
- **WHEN** a pending shift reminder SMS is due for an approved shift
- **THEN** the SMS processing job sends the reminder to the opted-in student and records delivery status

#### Scenario: Reminder due for cancelled shift
- **WHEN** a pending shift reminder SMS is due for a shift that is no longer approved
- **THEN** the system cancels or skips the reminder without sending SMS

### Requirement: Optional admin SMS alerts
The system SHALL support optional admin SMS alerts for operational events using admin SMS preferences and global SMS settings.

#### Scenario: Onboarding completion admin SMS alert
- **WHEN** a student completes onboarding and admin SMS alerts are enabled
- **THEN** the system enqueues SMS alerts for active admin accounts opted into onboarding SMS alerts

#### Scenario: Flagged evaluation admin SMS alert
- **WHEN** an evaluation is flagged and admin SMS alerts are enabled
- **THEN** the system enqueues SMS alerts for active admin accounts opted into flagged-evaluation SMS alerts
