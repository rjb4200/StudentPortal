## ADDED Requirements

### Requirement: Database schema for all entities
The system SHALL use a Supabase PostgreSQL database with the following tables, each with proper foreign keys, constraints, and performance indexes:

- `students`: `id` (UUID PK), `full_name`, `email` (unique), `phone`, `school_name`, `instructor_name`, `instructor_contact`, `status` (ENUM: 'pending', 'certified', 'expired'), `access_until` (timestamp), `no_show_count` (int, default 0), `is_blacklisted` (boolean, default false), `legal_signature` (text), `signature_ip` (text), `signature_timestamp` (timestamp), `created_at`
- `preceptors`: `id` (UUID PK), `full_name`, `bio` (text), `image_url` (text), `specialty_tags` (text[]), `station_unit` (ENUM: 'Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial'), `is_active` (boolean, default true)
- `schedules`: `id` (UUID PK), `student_id` (FK → students), `date` (date), `shift_type` (ENUM: 'full', 'day', 'night'), `status` (ENUM: 'pending', 'approved', 'rejected'), `created_at`
- `evaluations`: `id` (UUID PK), `preceptor_id` (FK → preceptors), `student_id` (FK → students), `clinical_rating` (int 1-5), `teaching_rating` (int 1-5), `safety_rating` (int 1-5), `overall_rating` (int 1-5), `comments` (text), `is_flagged` (boolean, derived), `created_at`
- `admin_notes`: `id` (UUID PK), `student_id` (FK → students), `note_text` (text), `priority` (ENUM: 'normal', 'high_accessibility'), `created_at`
- `messages`: `id` (UUID PK), `student_id` (FK → students), `sender` (ENUM: 'student', 'admin'), `message_text` (text), `created_at`
- `audit_log`: `id` (UUID PK), `action` (text), `performed_by` (text), `timestamp`

#### Scenario: Schema deployment
- **WHEN** the Supabase migration is applied
- **THEN** all 7 tables are created with correct column types, foreign key relationships, and indexes on `email`, `student_id`, `date`, and `preceptor_id`

### Requirement: Row Level Security on all tables
All tables SHALL have RLS enabled. Student policies SHALL restrict read/write to rows where an `auth.uid()` check matches. Admin policies SHALL grant full `ALL` access via an admin role check in `auth.users` metadata.

#### Scenario: RLS enforcement on students table
- **WHEN** a student queries the students table without admin role
- **THEN** only their own student row is returned

#### Scenario: RLS enforcement on evaluations table
- **WHEN** a student queries the evaluations table without admin role
- **THEN** only evaluations where `student_id` matches their UUID are returned

#### Scenario: Admin bypass RLS
- **WHEN** a user with admin role metadata queries any table
- **THEN** all rows are returned regardless of student ownership

### Requirement: Daily cron sweep for account expiration
A scheduled function SHALL run daily to identify students whose `access_until` timestamp has passed and update their status to `'expired'`. The function SHALL archive relevant data before expiring accounts.

#### Scenario: Single student expiration
- **WHEN** the daily cron sweep runs and a student's `access_until` timestamp is in the past
- **THEN** their `status` is updated to `'expired'`, and they can no longer access `/dashboard`

#### Scenario: Multiple student expirations
- **WHEN** the daily cron sweep runs and 20 students have expired `access_until` timestamps
- **THEN** all 20 students have `status` set to `'expired'` in a single batch operation

#### Scenario: No expired students
- **WHEN** the daily cron sweep runs and no students have expired
- **THEN** no status updates are performed and the sweep completes without changes

### Requirement: System health heartbeat
A health check endpoint SHALL perform a database read and write query. If the database times out or exceeds 90% capacity, the system SHALL trigger a Pushover emergency notification.

#### Scenario: Healthy database response
- **WHEN** the health endpoint is called and the database responds within the timeout
- **THEN** a 200 OK response is returned with database status

#### Scenario: Database timeout triggers emergency alert
- **WHEN** the health endpoint is called and the database query times out
- **THEN** a Pushover Emergency/High priority notification is sent to configured admin devices

#### Scenario: Database capacity warning triggers alert
- **WHEN** the health endpoint detects database capacity over 90%
- **THEN** a Pushover Emergency/High priority notification is sent to configured admin devices

### Requirement: CSV and PDF export
The admin analytics and maintenance sections SHALL support exporting evaluation data and full system data as CSV and PDF files. The "Master Export" on the maintenance tab SHALL export all data across all tables.

#### Scenario: CSV export of preceptor analytics
- **WHEN** an admin clicks "Export to CSV" on the preceptor analytics tab
- **THEN** a CSV file downloads containing preceptor evaluation metrics

#### Scenario: Master export downloads all data
- **WHEN** an admin clicks "Master Export" on the maintenance tab
- **THEN** a combined export (CSV or structured format) containing all table data downloads

### Requirement: Data purge workflow
After a successful master export download, the maintenance tab SHALL enable a "Purge Data" form. Confirming the purge SHALL delete all student, schedule, evaluation, message, and admin_note records while preserving preceptors and audit_log.

#### Scenario: Purge enabled after export
- **WHEN** an admin successfully downloads the master export
- **THEN** the "Purge Data" button becomes enabled and clickable

#### Scenario: Purge confirms data deletion
- **WHEN** an admin confirms the data purge
- **THEN** all records from students (cascading to schedules, evaluations, messages, admin_notes) are deleted, while preceptors and audit_log records are preserved

### Requirement: Audit logging
All significant actions SHALL be logged to the `audit_log` table with an action description, the username or identifier of the performer, and a timestamp.

#### Scenario: Action is logged
- **WHEN** an admin approves a student or terminates access
- **THEN** a row is inserted into `audit_log` with the action description, performer identifier, and current timestamp
