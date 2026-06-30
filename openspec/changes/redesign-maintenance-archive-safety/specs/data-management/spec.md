## MODIFIED Requirements

### Requirement: CSV and PDF export
The admin analytics and maintenance sections SHALL support exporting evaluation data and full system data as CSV and PDF files. The "Master Export" on the maintenance tab SHALL export all data across all tables and provide visible status feedback while preparing and completing the export.

#### Scenario: CSV export of preceptor analytics
- **WHEN** an admin clicks "Export to CSV" on the preceptor analytics tab
- **THEN** a CSV file downloads containing preceptor evaluation metrics

#### Scenario: Master export downloads all data
- **WHEN** an admin clicks "Master Export" on the maintenance tab
- **THEN** a combined export (CSV or structured format) containing all table data downloads
- **AND** the interface displays export progress or preparation status until completion or failure

#### Scenario: Master export completion is visible
- **WHEN** a master export completes successfully
- **THEN** the maintenance interface displays a completion state with the export date or filename context

#### Scenario: Master export failure is visible
- **WHEN** a master export fails
- **THEN** the maintenance interface displays an actionable error message and does not enable purge execution from that failed export attempt

### Requirement: Data purge workflow
After a successful master export download, the maintenance tab SHALL enable a purge review workflow. The workflow SHALL require a dry-run summary before execution, show counts for records that will be deleted, identify preserved record categories, require a non-empty admin reason, require typed confirmation, and execute deletion of all student, schedule, evaluation, message, and admin_note records while preserving preceptors, audit_log, and instructor/site/class registry records.

#### Scenario: Purge enabled after export
- **WHEN** an admin successfully downloads the master export
- **THEN** the maintenance interface enables purge review and indicates that export prerequisite is satisfied

#### Scenario: Purge dry-run summarizes impact
- **WHEN** an admin requests purge review after a successful master export
- **THEN** the system returns counts for students, schedules, evaluations, messages, and admin_notes that would be deleted
- **AND** the summary identifies preceptors, audit_log, instructors, training sites, and training classes as preserved categories

#### Scenario: Purge blocked without reason
- **WHEN** an admin attempts to execute purge without entering a reason
- **THEN** the system rejects the request and no data is deleted

#### Scenario: Purge blocked without typed confirmation
- **WHEN** an admin attempts to execute purge without entering the required typed confirmation phrase
- **THEN** the system rejects the request and no data is deleted

#### Scenario: Purge confirms data deletion
- **WHEN** an admin has completed master export, reviewed dry-run impact, entered a reason, entered the required typed confirmation, and submitted purge execution
- **THEN** all records from students (cascading to schedules, evaluations, messages, admin_notes) are deleted, while preceptors, audit_log, instructors, training sites, and training classes are preserved
- **AND** the system records the action in the audit log with performer, reason, and impact summary

#### Scenario: Purge status feedback is visible
- **WHEN** purge execution is pending, succeeds, or fails
- **THEN** the maintenance interface displays the current operation status and final outcome to the admin

### Requirement: Audit logging
All significant actions SHALL be logged to the `audit_log` table with an action description, the username or identifier of the performer, and a timestamp. High-risk maintenance actions SHALL include the admin-provided reason and impact summary in the audit record content. The Maintenance & Archive tab SHALL expose recent audit activity or a direct audit visibility section for maintenance-related actions.

#### Scenario: Action is logged
- **WHEN** an admin approves a student or terminates access
- **THEN** a row is inserted into `audit_log` with the action description, performer identifier, and current timestamp

#### Scenario: High-risk maintenance action is logged with reason
- **WHEN** an admin purges student data or deletes an abandoned registration
- **THEN** a row is inserted into `audit_log` containing the action, performer identifier, timestamp, admin-provided reason, and relevant impact details

#### Scenario: Recent audit activity is visible
- **WHEN** an admin views the Maintenance & Archive tab
- **THEN** the interface displays recent audit activity or a clear link to audit activity relevant to maintenance operations
