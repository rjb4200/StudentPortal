## ADDED Requirements

### Requirement: Cancel modal on existing shift click
When a student clicks a calendar date that already has a pending or approved shift, the system SHALL open a cancel confirmation modal instead of ignoring the click. The modal SHALL display the date, time range, current status, and a "Cancel Shift" button.

#### Scenario: Click on pending shift opens cancel modal
- **WHEN** a student clicks a date with a pending shift
- **THEN** a modal opens showing "Cancel Shift Request" with the date, time range, and a "Cancel Shift" button

#### Scenario: Click on approved shift opens cancel modal
- **WHEN** a student clicks a date with an approved shift
- **THEN** a modal opens showing "Cancel Shift" with the date, time range, and a "Cancel Shift" button

#### Scenario: Cancelled and rejected dates show no cancel option
- **WHEN** a student clicks a date with a cancelled or rejected shift
- **THEN** nothing happens (the date is already in a terminal state)

## MODIFIED Requirements

### Requirement: Admin approval workflow
The admin daily-ops "Action Required" panel SHALL display all non-cancelled, non-rejected schedules — both pending and approved — with Cancel buttons alongside the existing Approve/Reject buttons for pending shifts. Approved shifts SHALL show only a Cancel button.

#### Scenario: Approved shift shows cancel option
- **WHEN** an admin views the daily-ops panel
- **THEN** approved shifts are displayed with a "Cancel" button

#### Scenario: Cancelling an approved shift
- **WHEN** an admin clicks "Cancel" on an approved shift and confirms
- **THEN** the shift status changes to `'cancelled'` and the student receives a cancellation email
