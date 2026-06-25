## MODIFIED Requirements

### Requirement: Database schema for all entities
The system SHALL use a Supabase PostgreSQL database with the following tables, each with proper foreign keys, constraints, and performance indexes:

- `students`: `id` (UUID PK immutable enrollment id), `auth_user_id` (UUID nullable unique link to Supabase Auth user), `previous_student_id` (UUID nullable FK -> students), `training_site_id` (UUID nullable FK -> training_sites), `instructor_id` (UUID nullable FK -> instructors), `training_class_id` (UUID nullable FK -> training_classes), `full_name`, `email`, `phone`, `school_name`, `instructor_name`, `instructor_contact`, `status` (ENUM: 'pending', 'certified', 'expired', 'archived'), `onboarding_completed_at` (nullable timestamp), `access_until` (timestamp), `no_show_count` (int, default 0), `is_blacklisted` (boolean, default false), `is_test_record` (boolean, default false), `legal_signature` (text), `signature_ip` (text), `signature_timestamp` (timestamp), `created_at`
- `training_sites`: `id` (UUID PK), `name`, `organization_name`, `address`, `city`, `state`, `zip_code`, `main_phone`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`
- `instructors`: `id` (UUID PK), `training_site_id` (nullable FK -> training_sites), `first_name`, `last_name`, `email`, `mobile_phone`, `business_phone`, `credentials`, `title`, `preferred_contact_method`, `preferred_contact_hours`, `contact_instructions`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`
- `training_classes`: `id` (UUID PK), `training_site_id` (FK -> training_sites), `instructor_id` (FK -> instructors), `name`, `class_start_date` (date), `ride_time_end_date` (date), `notes`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`
- `preceptors`: `id` (UUID PK), `full_name`, `bio` (text), `image_url` (text), `specialty_tags` (text[]), `station_unit` (ENUM: 'Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial'), `is_active` (boolean, default true)
- `schedules`: `id` (UUID PK), `student_id` (FK -> students), `date` (date), `shift_type` (ENUM: 'full', 'day', 'night'), `status` (ENUM: 'pending', 'approved', 'rejected'), `created_at`
- `evaluations`: `id` (UUID PK), `preceptor_id` (FK -> preceptors), `student_id` (FK -> students), `clinical_rating` (int 1-5), `teaching_rating` (int 1-5), `safety_rating` (int 1-5), `overall_rating` (int 1-5), `comments` (text), `is_flagged` (boolean, derived), `created_at`
- `admin_notes`: `id` (UUID PK), `student_id` (FK -> students), `note_text` (text), `priority` (ENUM: 'normal', 'high_accessibility'), `created_at`
- `messages`: `id` (UUID PK), `student_id` (FK -> students), `sender` (ENUM: 'student', 'admin'), `message_text` (text), `created_at`
- `audit_log`: `id` (UUID PK), `action` (text), `performed_by` (text), `timestamp`

#### Scenario: Schema deployment
- **WHEN** the Supabase migration is applied
- **THEN** all existing and new registry tables are created or updated with correct column types, foreign key relationships, and indexes on `email`, `auth_user_id`, `previous_student_id`, `student_id`, `date`, `preceptor_id`, `training_site_id`, `instructor_id`, `training_class_id`, class status, and class date windows
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

#### Scenario: Class relationships are optional for existing students
- **WHEN** an existing student row has no `training_class_id`, `training_site_id`, or `instructor_id`
- **THEN** the row remains valid and keeps its existing access behavior

### Requirement: Row Level Security on all tables
All tables SHALL have RLS enabled. Student policies SHALL restrict read/write to rows where an `auth.uid()` check matches `students.auth_user_id` for the relevant enrollment row. Admin policies SHALL grant full `ALL` access via an admin role check in auth metadata. Registry table policies SHALL prevent public and student users from reading pending, inactive, future-hidden, or expired classes while allowing admins to manage all registry records.

#### Scenario: RLS enforcement on students table
- **WHEN** a student queries the students table without admin role
- **THEN** only student rows whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: RLS enforcement on evaluations table
- **WHEN** a student queries the evaluations table without admin role
- **THEN** only evaluations where `student_id` references a student row whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: Public class option excludes inactive records
- **WHEN** a public class option query is made
- **THEN** pending, rejected, suspended, archived, future-hidden, and expired registry records are not returned

#### Scenario: Admin bypass RLS
- **WHEN** a user with admin role metadata queries any table
- **THEN** all rows are returned regardless of student ownership, registry status, or class date window

### Requirement: CSV and PDF export
The admin analytics and maintenance sections SHALL support exporting evaluation data and full system data as CSV and PDF files. The "Master Export" on the maintenance tab SHALL export all relevant data across all tables, including instructor, training site, and training class registry data.

#### Scenario: CSV export of preceptor analytics
- **WHEN** an admin clicks "Export to CSV" on the preceptor analytics tab
- **THEN** a CSV file downloads containing preceptor evaluation data

#### Scenario: Master export downloads all data
- **WHEN** an admin clicks "Master Export" on the maintenance tab
- **THEN** a combined export (CSV or structured format) containing student data and registry table data downloads

### Requirement: Data purge workflow
After a successful master export download, the maintenance tab SHALL enable a "Purge Data" form. Confirming the purge SHALL delete all student, schedule, evaluation, message, and admin_note records while preserving preceptors and audit_log. Registry purge behavior for instructors, training sites, and training classes SHALL be explicit in the implementation and SHALL NOT accidentally orphan student records.

#### Scenario: Purge enabled after export
- **WHEN** an admin successfully downloads the master export
- **THEN** the "Purge Data" button becomes enabled and clickable

#### Scenario: Purge confirms data deletion
- **WHEN** an admin confirms the data purge
- **THEN** all records from students (cascading to schedules, evaluations, messages, admin_notes) are deleted, while preceptors and audit_log records are preserved
- **AND** registry records are either preserved intentionally or purged safely according to the implemented purge policy
