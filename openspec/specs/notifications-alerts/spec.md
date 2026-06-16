## Purpose

Transactional email notifications, Pushover alerts, iCal feeds, and email delivery handling.

## Requirements

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

### Requirement: Pushover admin alerts
The system SHALL send Pushover notifications to admin devices for critical events: new student onboarding completion, evaluation flag alerts, and system health emergencies.

#### Scenario: New student push alert
- **WHEN** a student completes the knowledge gate and `is_certified` is set to `true`
- **THEN** a Pushover notification is sent to the Training Major with high priority, containing the student's name and a prompt to review

#### Scenario: Flagged evaluation push alert
- **WHEN** a student submits an evaluation with `is_flagged = true` (overall_rating below 3)
- **THEN** a Pushover notification is sent to the Training Major with high priority, containing the preceptor name, student name, and the low rating

#### Scenario: System health emergency push alert
- **WHEN** the system health heartbeat detects a database timeout or capacity exception (over 90% full)
- **THEN** a Pushover notification is sent with Emergency/High priority parameters to all configured admin devices

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

### Requirement: Pushover priority escalation
Pushover notifications for system emergencies SHALL use the Emergency/High priority parameters, including retry and expire settings for persistent alerting until acknowledged.

#### Scenario: Emergency notification persists
- **WHEN** a system health failure triggers a Pushover alert with Emergency priority
- **THEN** the alert repeats at the configured retry interval until the admin acknowledges it or the condition resolves

### Requirement: Email delivery failure handling
If a Resend email delivery fails, the system SHALL log the failure and retry up to 3 times with exponential backoff before marking the delivery as permanently failed.

#### Scenario: Email retry on failure
- **WHEN** a Resend API call returns a non-2xx status
- **THEN** the system retries the delivery up to 3 times with increasing delays before logging a permanent failure
