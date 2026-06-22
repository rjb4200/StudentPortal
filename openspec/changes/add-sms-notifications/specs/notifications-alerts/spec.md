## ADDED Requirements

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
