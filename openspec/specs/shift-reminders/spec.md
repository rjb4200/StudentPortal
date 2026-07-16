## Purpose

Define day-before email reminders for approved student rides.

## Requirements

### Requirement: Day-before approved-ride reminder
The system SHALL run a protected daily reminder job at 1800 UTC. The job SHALL identify approved student rides occurring on the following calendar date in America/New_York and attempt to send each student one branded reminder email. The reminder SHALL include the scheduled date and time, applicable crew shift, on-duty Chief, Station 1 reporting instruction, and an active Station 1 map link when configured.

#### Scenario: Eligible approved ride receives a reminder
- **WHEN** the daily reminder job runs and an approved ride is scheduled for the following America/New_York calendar date
- **THEN** the student receives one reminder containing the ride details, applicable crew shift and Chief, Station 1 reporting instruction, and map link

#### Scenario: Non-approved ride is excluded
- **WHEN** the daily reminder job runs and a ride for the following America/New_York calendar date is pending, rejected, or cancelled
- **THEN** no reminder is sent for that ride

#### Scenario: Map document is unavailable
- **WHEN** the Station 1 map has no active usable document URL
- **THEN** the job sends the reminder with Station 1 reporting instruction without a map link
- **AND** records the missing map condition for operators

### Requirement: Idempotent reminder delivery
The system SHALL persist reminder delivery state by schedule and reminder type before email delivery is attempted. A previously claimed or delivered reminder SHALL prevent a subsequent job execution from sending another reminder for the same scheduled ride.

#### Scenario: Job retry after a successful delivery
- **WHEN** the reminder job is invoked again for a ride that already has a reminder delivery record
- **THEN** the job does not send a second reminder email for that ride

#### Scenario: Manual job invocation
- **WHEN** an authorized operator invokes the reminder route after its scheduled execution for the same ride
- **THEN** the route does not create a duplicate reminder delivery

### Requirement: Reminder job telemetry
The reminder job SHALL record a durable success or failure entry in system job history with counts for eligible rides, claimed reminders, delivered reminders, skipped duplicates, and delivery failures.

#### Scenario: Reminder job completes with mixed outcomes
- **WHEN** a reminder job finds eligible rides and one email delivery fails
- **THEN** the job records a completed run with the delivered and failed counts
- **AND** attempts for other eligible rides are not prevented by that failure
