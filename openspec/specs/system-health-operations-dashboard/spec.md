## Purpose

Admin-facing system health and operations visibility for database, storage, configuration, scheduled job, operational alert, and summary metric status.

## Requirements

### Requirement: Admin system health page
The system SHALL provide an admin-only `/admin/system` page that summarizes portal health, operational alerts, scheduled job status, and key portal metrics.

#### Scenario: Admin opens system health dashboard
- **WHEN** an authenticated admin visits `/admin/system`
- **THEN** the system displays the health dashboard with service checks, scheduled job status, operational alerts, and summary metrics

#### Scenario: Non-admin cannot access system health dashboard
- **WHEN** a non-admin user visits `/admin/system`
- **THEN** the system denies access using the existing admin route protection

#### Scenario: Admin command center links to system dashboard
- **WHEN** an admin opens the Admin Command Center menu
- **THEN** the menu includes a link to `/admin/system`

### Requirement: System health aggregation API
The system SHALL provide an admin-only API endpoint that returns sanitized system health data without exposing secret environment variable values or service-role credentials.

#### Scenario: Admin requests system health data
- **WHEN** an authenticated admin requests the system health API
- **THEN** the response includes service checks, operational alerts, scheduled job status, summary metrics, and recent activity data

#### Scenario: Non-admin requests system health data
- **WHEN** a non-admin or unauthenticated user requests the system health API
- **THEN** the system returns an authorization error and does not return operational health details

#### Scenario: Secrets are not exposed
- **WHEN** the system health API reports environment and email configuration status
- **THEN** it returns only boolean or status summaries and never returns raw environment variable values

### Requirement: Service health checks
The system health dashboard SHALL show database, storage, authentication, email configuration, environment configuration, and application version/build checks based on measurable local application signals.

#### Scenario: Database check succeeds
- **WHEN** the admin views the system health dashboard and the database heartbeat query succeeds within the timeout
- **THEN** the database check displays a healthy status with measured latency or timestamp context

#### Scenario: Database check fails
- **WHEN** the admin views the system health dashboard and the database heartbeat query fails or times out
- **THEN** the database check displays an attention status and the operational alerts include a database warning

#### Scenario: Storage usage is summarized
- **WHEN** the admin views the system health dashboard
- **THEN** the storage section displays configured buckets with object counts and byte totals when storage metadata is available

#### Scenario: Email telemetry is honest
- **WHEN** the admin views the email delivery status section
- **THEN** the dashboard displays whether email is configured and states that detailed email delivery failure history is not currently tracked

#### Scenario: Environment configuration is summarized
- **WHEN** required public or server environment variables are missing or invalid
- **THEN** the dashboard displays a configuration alert without exposing secret values

#### Scenario: Application version is displayed
- **WHEN** the admin views the system health dashboard
- **THEN** the dashboard displays the application version from the project manifest and build/deployment identifiers when available

### Requirement: Scheduled job health status
The system health dashboard SHALL show last success, last failure, last run duration, last expired count, and staleness status for the daily expiration sweep using durable job run history.

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

### Requirement: Summary metrics
The system health dashboard SHALL display concise portal summary metrics for active students, pending approvals, active instructors, active training sites, and recent operational activity.

#### Scenario: Active and pending student metrics
- **WHEN** an admin views summary metrics
- **THEN** the dashboard displays active student count and pending approval count, where pending approvals are pending students with completed onboarding

#### Scenario: Registry metrics
- **WHEN** an admin views summary metrics
- **THEN** the dashboard displays active instructor count and active training site count

#### Scenario: Recent activity is summarized
- **WHEN** recent audit or system job activity exists
- **THEN** the dashboard displays a concise recent activity or recent errors section without exposing sensitive student data unnecessarily

### Requirement: System Health operational layout
The System Health page SHALL use shared operational UI components for its page header, overall status banner, metric facts, check sections, operational alerts, empty states, and recent activity lists.

#### Scenario: Admin views system health with shared layout
- **WHEN** an authenticated admin opens `/admin/system`
- **THEN** the page uses the shared operational header, status banner, fact grid, section card, alert, and recent-list patterns while preserving existing health data and refresh behavior

#### Scenario: System health has no alerts
- **WHEN** the health API returns no operational alerts
- **THEN** the page displays a shared empty state or neutral empty message that is visually consistent with other admin operational screens

#### Scenario: System health reports an error
- **WHEN** the health API request fails or returns an error
- **THEN** the page displays the error using the shared alert pattern without exposing secret values
