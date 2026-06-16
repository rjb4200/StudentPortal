## MODIFIED Requirements

### Requirement: Database schema for all entities
The system SHALL use a Supabase PostgreSQL database with the following tables, each with proper foreign keys, constraints, and performance indexes:

- `students`: `id` (UUID PK immutable enrollment id), `auth_user_id` (UUID nullable unique link to Supabase Auth user), `previous_student_id` (UUID nullable FK -> students), `full_name`, `email`, `phone`, `school_name`, `instructor_name`, `instructor_contact`, `status` (ENUM: 'pending', 'certified', 'expired', 'archived'), `access_until` (timestamp), `no_show_count` (int, default 0), `is_blacklisted` (boolean, default false), `is_test_record` (boolean, default false), `legal_signature` (text), `signature_ip` (text), `signature_timestamp` (timestamp), `created_at`
- `preceptors`: `id` (UUID PK), `full_name`, `bio` (text), `image_url` (text), `specialty_tags` (text[]), `station_unit` (ENUM: 'Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial'), `is_active` (boolean, default true)
- `schedules`: `id` (UUID PK), `student_id` (FK -> students), `date` (date), `shift_type` (ENUM: 'full', 'day', 'night'), `status` (ENUM: 'pending', 'approved', 'rejected'), `created_at`
- `evaluations`: `id` (UUID PK), `preceptor_id` (FK -> preceptors), `student_id` (FK -> students), `clinical_rating` (int 1-5), `teaching_rating` (int 1-5), `safety_rating` (int 1-5), `overall_rating` (int 1-5), `comments` (text), `is_flagged` (boolean, derived), `created_at`
- `admin_notes`: `id` (UUID PK), `student_id` (FK -> students), `note_text` (text), `priority` (ENUM: 'normal', 'high_accessibility'), `created_at`
- `messages`: `id` (UUID PK), `student_id` (FK -> students), `sender` (ENUM: 'student', 'admin'), `message_text` (text), `created_at`
- `audit_log`: `id` (UUID PK), `action` (text), `performed_by` (text), `timestamp`

#### Scenario: Schema deployment
- **WHEN** the Supabase migration is applied
- **THEN** all 7 tables are created or updated with correct column types, foreign key relationships, and indexes on `email`, `auth_user_id`, `previous_student_id`, `student_id`, `date`, and `preceptor_id`

#### Scenario: Student primary key remains stable
- **WHEN** a student completes onboarding, receives auth access, expires, is archived, or re-registers later
- **THEN** each existing `students.id` value remains unchanged

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
