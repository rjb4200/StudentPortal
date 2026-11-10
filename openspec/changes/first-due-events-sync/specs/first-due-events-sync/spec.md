# Spec Delta

## Purpose

Project approved student ride sign-ups into First Due Events & Activities so the crew sees who is riding each day, without manual re-entry.

## ADDED Requirements

### Requirement: One event per approved shift

The system SHALL create exactly one First Due Event for each approved schedule row in the sync window. The event SHALL identify the student, the shift date, and the shift start and end times, and SHALL include the assigned preceptor's name when one is set.

#### Scenario: Approved shift posts one event
- **WHEN** an approved schedule falls in the sync window and no linked event exists
- **THEN** exactly one event is created for that schedule row
- **AND** the event identifies the student, the date, and the time range

#### Scenario: Preceptor named on the event
- **WHEN** an approved schedule has an assigned preceptor
- **THEN** the event body includes the preceptor's name

### Requirement: Ledger-linked event identity

The system SHALL identify the First Due event for a schedule through the sync ledger, which records the schedule id and the event id. The event body SHALL NOT contain a portal token; identity SHALL NOT depend on matching names or title text.

#### Scenario: Event body stays human-readable
- **WHEN** an event is created for a schedule
- **THEN** its body lists only the student, shift, and optional preceptor

#### Scenario: Re-run does not duplicate
- **WHEN** a ledger row already links the schedule to an event
- **THEN** the run does not create another event for that schedule

### Requirement: Daily Eastern-time reconciliation window

The system SHALL reconcile once per day over a five-day window covering the current calendar day and the next four days in `America/New_York`. Dates and times SHALL be resolved in that zone and written to the web surface as local wall-clock strings.

#### Scenario: Five days are considered
- **WHEN** the daily reconciliation runs
- **THEN** approved schedules dated today through today+4 in Eastern time are considered

#### Scenario: Re-run does not duplicate
- **WHEN** reconciliation runs again with unchanged input
- **THEN** no additional events are created

#### Scenario: Daylight saving transition
- **WHEN** the window crosses a daylight saving transition
- **THEN** every shift is written at the Eastern wall-clock time the tenant expects

### Requirement: Cancellation by marker

When a linked schedule is cancelled or rejected, the system SHALL mark the event by prefixing its title with `[CANCELLED]`. The system SHALL delete the event only when the title cannot be updated and the ledger links that event to a schedule.

#### Scenario: Cancelled shift is marked
- **WHEN** an approved schedule with a linked event becomes cancelled or rejected
- **THEN** the event title is prefixed with `[CANCELLED]`

#### Scenario: Deletion fallback
- **WHEN** the title cannot be updated and the ledger links the event to a schedule
- **THEN** the event may be deleted
- **AND** the ledger records the deletion

### Requirement: Non-interference with foreign events

The system SHALL NOT modify or delete any First Due event that is not linked to a schedule in the sync ledger.

#### Scenario: Unlinked event is left unchanged
- **WHEN** an event with no ledger link exists in the window
- **THEN** the system leaves it unchanged

### Requirement: Durable sync ledger

The system SHALL record, per schedule row, the linked First Due event identity and the sync state in durable storage.

#### Scenario: Posted state is recorded
- **WHEN** an event is created for a schedule row
- **THEN** the ledger records the schedule link, event identity, and posted state

#### Scenario: Terminal state is recorded
- **WHEN** a schedule's event is verified as present or marked cancelled
- **THEN** the ledger records that terminal state for the run
