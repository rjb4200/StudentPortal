## Purpose

Define the database schema, RLS model, expiration sweep, exports, purge workflow, health checks, and audit logging for portal data.
## Requirements
### Requirement: Database schema for all entities
The system SHALL use a Supabase PostgreSQL database with the following tables, each with proper foreign keys, constraints, and performance indexes:

- `students`: `id` (UUID PK immutable enrollment id), `auth_user_id` (UUID nullable unique link to Supabase Auth user), `previous_student_id` (UUID nullable FK -> students), `full_name`, `email`, `phone`, `school_name`, `instructor_name`, `instructor_contact`, `status` (ENUM: 'pending', 'certified', 'expired', 'archived'), `onboarding_completed_at` (nullable timestamp), `access_until` (timestamp), `no_show_count` (int, default 0), `is_blacklisted` (boolean, default false), `is_test_record` (boolean, default false), `legal_signature` (text), `signature_ip` (text), `signature_timestamp` (timestamp), `created_at`
- `preceptors`: `id` (UUID PK), `full_name`, `bio` (text), `image_url` (text), `specialty_tags` (text[]), `station_unit` (ENUM: 'Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial'), `is_active` (boolean, default true)
- `schedules`: `id` (UUID PK), `student_id` (FK -> students), `date` (date), `shift_type` (ENUM: 'full', 'day', 'night'), `status` (ENUM: 'pending', 'approved', 'rejected'), `created_at`
- `evaluations`: `id` (UUID PK), `preceptor_id` (FK -> preceptors), `student_id` (FK -> students), `clinical_rating` (int 1-5), `teaching_rating` (int 1-5), `safety_rating` (int 1-5), `overall_rating` (int 1-5), `comments` (text), `is_flagged` (boolean, derived), `created_at`
- `admin_notes`: `id` (UUID PK), `student_id` (FK -> students), `note_text` (text), `priority` (ENUM: 'normal', 'high_accessibility'), `created_at`
- `messages`: `id` (UUID PK), `student_id` (FK -> students), `sender` (ENUM: 'student', 'admin'), `message_text` (text), `created_at`
- `audit_log`: `id` (UUID PK), `action` (text), `performed_by` (text), `timestamp`

#### Scenario: Schema deployment
- **WHEN** the Supabase migration is applied
- **THEN** all 7 tables are created or updated with correct column types, foreign key relationships, and indexes on `email`, `auth_user_id`, `previous_student_id`, `student_id`, `date`, and `preceptor_id`
- **AND** the students table includes an indexed nullable `onboarding_completed_at` timestamp for lifecycle classification

#### Scenario: Student primary key remains stable
- **WHEN** a student completes onboarding, receives auth access, expires, is archived, or re-registers later
- **THEN** each existing `students.id` value remains unchanged

#### Scenario: Completion marker classifies pending rows
- **WHEN** a student row has `status = 'pending'` and `onboarding_completed_at IS NULL`
- **THEN** the row represents an incomplete or abandoned registration start

#### Scenario: Approval-ready marker classifies pending rows
- **WHEN** a student row has `status = 'pending'` and `onboarding_completed_at IS NOT NULL`
- **THEN** the row represents a completed onboarding awaiting admin approval

### Requirement: Row Level Security on all tables
All tables SHALL have RLS enabled. Student policies SHALL restrict read/write to rows where an `auth.uid()` check matches `students.auth_user_id` for the relevant enrollment row. Admin policies SHALL grant full `ALL` access via an admin role check in auth metadata.

#### Scenario: RLS enforcement on students table
- **WHEN** a student queries the students table without admin role
- **THEN** only student rows whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: RLS enforcement on evaluations table
- **WHEN** a student queries the evaluations table without admin role
- **THEN** only evaluations where `student_id` references a student row whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: Admin bypass RLS
- **WHEN** a user with admin role metadata queries any table
- **THEN** all rows are returned regardless of student ownership

### Requirement: Daily cron sweep for account expiration
A scheduled function SHALL run daily to identify students whose `access_until` timestamp has passed and update their status to `'expired'` unless they are already `archived`. The function SHALL preserve relevant data before expiring accounts.

#### Scenario: Single student expiration
- **WHEN** the daily cron sweep runs and a student's `access_until` timestamp is in the past
- **THEN** their `status` is updated to `'expired'`, and they can no longer access `/dashboard`

#### Scenario: Multiple student expirations
- **WHEN** the daily cron sweep runs and 20 students have expired `access_until` timestamps
- **THEN** all 20 students have `status` set to `'expired'` in a single batch operation

#### Scenario: Archived student skipped by expiration
- **WHEN** the daily cron sweep runs and a student already has `status = 'archived'`
- **THEN** the student's status remains `archived`

#### Scenario: No expired students
- **WHEN** the daily cron sweep runs and no students have expired
- **THEN** no status updates are performed and the sweep completes without changes

### Requirement: System health heartbeat
A health check endpoint SHALL perform a database read query. If the database query times out or fails, the system SHALL return an unhealthy response without attempting push notification delivery.

#### Scenario: Healthy database response
- **WHEN** the health endpoint is called and the database responds within the timeout
- **THEN** a 200 OK response is returned with database status

#### Scenario: Database timeout returns unhealthy response
- **WHEN** the health endpoint is called and the database query times out
- **THEN** the endpoint returns a 500 response with unhealthy database status

#### Scenario: Database failure returns unhealthy response
- **WHEN** the health endpoint is called and the database query fails
- **THEN** the endpoint returns a 500 response with the failure details

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

