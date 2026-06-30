## MODIFIED Requirements

### Requirement: Daily cron sweep for account expiration
A scheduled function SHALL run daily to identify students whose `access_until` timestamp has passed and update their status to `'expired'` unless they are already `archived`. The function SHALL preserve relevant data before expiring accounts. Each cron sweep execution SHALL record durable system job run history with job name, success or failure status, start and finish timestamps, duration, summary metadata, and failure message when applicable.

#### Scenario: Single student expiration
- **WHEN** the daily cron sweep runs and a student's `access_until` timestamp is in the past
- **THEN** their `status` is updated to `'expired'`, and they can no longer access `/dashboard`
- **AND** the sweep records a successful system job run with an expired count of 1

#### Scenario: Multiple student expirations
- **WHEN** the daily cron sweep runs and 20 students have expired `access_until` timestamps
- **THEN** all 20 students have `status` set to `'expired'` in a single batch operation
- **AND** the sweep records a successful system job run with an expired count of 20

#### Scenario: Archived student skipped by expiration
- **WHEN** the daily cron sweep runs and a student already has `status = 'archived'`
- **THEN** the student's status remains `archived`

#### Scenario: No expired students
- **WHEN** the daily cron sweep runs and no students have expired
- **THEN** no status updates are performed and the sweep completes without changes
- **AND** the sweep records a successful system job run with an expired count of 0

#### Scenario: Cron sweep failure is recorded
- **WHEN** the daily cron sweep starts but fails during database reads or updates
- **THEN** the sweep records a failed system job run with timing data and a failure message when the database can accept the failure record
- **AND** the endpoint returns an error response

#### Scenario: Cron run history supports health dashboard
- **WHEN** an admin views system health
- **THEN** the system can query the daily cron sweep run history to determine last success, last failure, last expired count, and whether the job is stale
