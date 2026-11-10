# Spec Delta

## Purpose

Keep the long-lived First Due session and the undocumented write path honest: fail closed when authentication is lost, verify writes independently, and alert an admin when the contract drifts.

## ADDED Requirements

### Requirement: Server-only session credential

The stored First Due session SHALL be server-only and SHALL NOT be exposed to clients, logs, API responses, or the repository.

#### Scenario: Credential is not echoed
- **WHEN** sync status, alerts, or health data are produced
- **THEN** the session value is not included

#### Scenario: Capture artifacts are excluded
- **WHEN** network captures or derived environment files are created
- **THEN** they are excluded from version control

### Requirement: Fail-closed session canary

Before any write in a run, the system SHALL perform a read of the target window. If that read is rejected or returns a login page, the run SHALL stop without creating or modifying events and SHALL raise an authentication alert.

#### Scenario: Expired or rejected session
- **WHEN** the canary read is unauthorized or returns a login page
- **THEN** no events are created or modified in that run
- **AND** an authentication alert is raised

#### Scenario: Healthy session
- **WHEN** the canary read returns the expected event payload
- **THEN** writes may proceed

### Requirement: Independent writer and verifier

Verification of a written event SHALL use a path different from the path used to write it.

#### Scenario: Different paths used
- **WHEN** an event is written through the shadow session
- **THEN** verification reads through a different documented endpoint or a fresh capture

### Requirement: Post-write observation and drift alert

After a write that reports success, the system SHALL re-read the window and confirm the correlation token is present and the response parses. When the token is absent or the payload cannot be parsed, the system SHALL mark the schedule as drift, retry a bounded number of times, and then raise an update-required alert naming the affected schedule.

#### Scenario: Write not observed
- **WHEN** a write reports success but the token is absent on re-read
- **THEN** the schedule is marked as drift
- **AND** an update-required alert names the affected schedule

#### Scenario: Response contract changed
- **WHEN** a read response cannot be parsed into the expected event shape
- **THEN** an update-required alert is raised

### Requirement: Kill switch

A server-side configuration flag SHALL disable all First Due writes without a code deployment.

#### Scenario: Sync disabled
- **WHEN** the kill switch is off
- **THEN** no events are created, modified, or deleted
- **AND** the run records that writes were skipped

### Requirement: Run history and operator alerts

The system SHALL record every sync run's outcome durably and SHALL deliver alerts through email and a push channel.

#### Scenario: Alert delivery
- **WHEN** an authentication alert or drift alert is raised
- **THEN** an email and a push notification are attempted

#### Scenario: Run history
- **WHEN** a sync run finishes, whether succeeded, skipped, or failed
- **THEN** its outcome is recorded in durable job history
