## ADDED Requirements

### Requirement: Maintenance workflows are separated by risk
The Maintenance & Archive tab SHALL present separate sections for export, archive cleanup, purge, calendar feeds, and audit visibility. Routine and informational actions SHALL be visually separated from destructive actions. High-risk actions SHALL appear in a distinct danger zone that is not visually grouped with routine admin workflows.

#### Scenario: Admin views maintenance sections
- **WHEN** an admin opens the Maintenance & Archive tab
- **THEN** the page displays distinct sections for export, archive cleanup, purge, calendar feeds, and audit visibility
- **AND** destructive purge controls are visually separated from routine export and calendar-feed controls

#### Scenario: High-risk actions are isolated
- **WHEN** an admin scans the Maintenance & Archive tab
- **THEN** high-risk destructive actions are grouped in a clearly labeled danger zone using warning/destructive visual treatment

### Requirement: Maintenance UI uses WFD safety branding
The Maintenance & Archive tab SHALL use WFD visual branding to communicate administrative risk. Crimson SHALL indicate destructive or authority actions, gold SHALL indicate caution or review, sage SHALL indicate safe or completed states, and charcoal SHALL frame command/administrative context.

#### Scenario: Risk states use branded colors
- **WHEN** the maintenance interface shows destructive, caution, success, and command states
- **THEN** those states use WFD crimson, gold, sage, and charcoal styling consistently

## MODIFIED Requirements

### Requirement: Aggregate iCal calendar feed
The system SHALL generate an aggregate iCal subscription URL that displays all scheduled shifts for all active students, color-coded by shift type, for admin and preceptor use. The Maintenance & Archive tab SHALL present the aggregate feed in a dedicated calendar-feed section with clear sensitivity guidance and copy/status feedback.

#### Scenario: Admin subscribes to aggregate feed
- **WHEN** an admin copies the aggregate iCal feed URL and subscribes in a calendar client
- **THEN** all students' approved shifts appear as calendar events with student name and shift type visible

#### Scenario: Admin copies aggregate feed URL
- **WHEN** an admin clicks the copy action for the aggregate iCal feed
- **THEN** the interface copies the full URL and displays visible success or failure feedback

#### Scenario: Calendar feed sensitivity is visible
- **WHEN** an admin views the calendar-feed section
- **THEN** the interface explains that the aggregate feed exposes operational schedule information and should be shared only with authorized users

### Requirement: Master export and data purge
The maintenance tab SHALL provide a dedicated export section with a "Master Export" action that downloads all data and displays export status feedback. Once the download completes, the purge section SHALL allow an admin to request a dry-run summary before enabling final purge confirmation. The purge workflow SHALL remain separated from routine maintenance actions and SHALL require deliberate confirmation before clearing student data.

#### Scenario: Master export enables purge review
- **WHEN** an admin clicks "Master Export" and the download completes
- **THEN** the export section displays a successful completion state
- **AND** the purge section allows the admin to request or view purge dry-run details

#### Scenario: Purge data confirmation
- **WHEN** an admin reviews the purge dry-run summary, provides a reason, enters the required typed confirmation, and submits the purge
- **THEN** all student, schedule, evaluation, message, and note records are deleted
- **AND** the interface displays progress and final completion feedback

#### Scenario: Purge remains blocked before export
- **WHEN** an admin has not completed a master export in the current maintenance session
- **THEN** the purge execution action remains disabled and explains that a master export is required first

### Requirement: Abandoned registration cleanup
The Maintenance & Archive tab SHALL display an abandoned-registration cleanup view listing students with `status = 'pending'` and `onboarding_completed_at IS NULL`. The view SHALL show all incomplete pending records, visually flag records older than 24 hours, and allow admins to delete abandoned records through the safe student deletion API only after reviewing the record, entering an admin reason, and completing deliberate confirmation.

#### Scenario: All incomplete pending registrations are listed
- **WHEN** an admin opens Maintenance & Archive
- **THEN** the abandoned-registration cleanup view lists students with `status = 'pending'` and `onboarding_completed_at IS NULL`

#### Scenario: Approval-ready students are excluded from cleanup
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NOT NULL`
- **THEN** the student does not appear in the abandoned-registration cleanup view

#### Scenario: Certified students are excluded from cleanup
- **WHEN** a student has `status = 'certified'`
- **THEN** the student does not appear in the abandoned-registration cleanup view

#### Scenario: Stale abandoned registration is flagged
- **WHEN** an incomplete pending registration is older than 24 hours
- **THEN** the cleanup view visually flags the record as stale or 24h+

#### Scenario: Same-day abandoned registration remains visible
- **WHEN** an incomplete pending registration is less than 24 hours old
- **THEN** the cleanup view still lists the record without the stale warning

#### Scenario: Admin deletes abandoned registration
- **WHEN** an admin opens the delete confirmation for an abandoned registration, enters a reason, completes the required typed confirmation, and submits
- **THEN** the safe student deletion API deletes the student row and any cascaded data
- **AND** the cleanup view refreshes without the deleted record
- **AND** the interface displays completion or error feedback
