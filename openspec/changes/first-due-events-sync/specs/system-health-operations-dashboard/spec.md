# Spec Delta

## MODIFIED Requirements

### Requirement: Scheduled job health status
The system health dashboard SHALL show last success, last failure, last run duration, last expired count, and staleness status for the daily expiration sweep using durable job run history. It SHALL also show last success, last failure, last run outcome, and staleness status for the First Due events sync using the same durable job run history.

#### Scenario: Last cron success is visible
- **WHEN** the daily expiration sweep has a successful recorded run
- **THEN** the dashboard displays the last successful run timestamp, duration, and expired student count from the run summary

#### Scenario: Last cron failure is visible
- **WHEN** the daily expiration sweep has a failed recorded run
- **THEN** the dashboard displays the last failed run timestamp and failure message summary

#### Scenario: Cron run is stale
- **WHEN** the daily expiration sweep has no successful run within the configured stale threshold
- **THEN** the dashboard displays an operational alert that the scheduled job may not be running

#### Scenario: Cron has never run
- **WHEN** no run history exists for the daily expiration sweep
- **THEN** the dashboard displays an unknown or warning status explaining that no cron run has been recorded yet

#### Scenario: First Due sync success is visible
- **WHEN** the First Due events sync has a successful recorded run
- **THEN** the dashboard displays the last successful run timestamp and outcome from the run summary

#### Scenario: First Due sync is stale or failed
- **WHEN** the First Due events sync has no successful run within the configured stale threshold or its latest run failed
- **THEN** the dashboard displays an operational alert that the First Due sync may not be running or needs attention

### Requirement: Operational alerts
The system health dashboard SHALL compute operational alerts from measurable health checks and distinguish attention-required problems from informational limitations.

#### Scenario: Missing environment variable alert
- **WHEN** a required environment variable is missing or invalid
- **THEN** the dashboard includes an operational alert naming the missing or invalid configuration key without revealing secret values

#### Scenario: Cron failure alert
- **WHEN** the latest daily expiration sweep run failed or the job is stale
- **THEN** the dashboard includes an operational alert for the scheduled job

#### Scenario: Storage warning alert
- **WHEN** storage metadata cannot be loaded or bucket usage crosses the configured warning threshold
- **THEN** the dashboard includes a storage warning with available context

#### Scenario: Email limitation notice
- **WHEN** email is configured but durable delivery failure telemetry is not implemented
- **THEN** the dashboard displays the limitation as informational rather than as a failed health check

#### Scenario: First Due authentication alert
- **WHEN** the latest First Due sync run reports an authentication failure or a rejected session
- **THEN** the dashboard includes an operational alert naming the First Due session as needing attention without revealing the session value

#### Scenario: First Due drift alert
- **WHEN** the latest First Due sync run reports one or more schedule records in a drift state
- **THEN** the dashboard includes an operational alert summarizing the count of drifted records
