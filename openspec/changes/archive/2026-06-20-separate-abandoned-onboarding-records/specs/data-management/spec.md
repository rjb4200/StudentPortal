## MODIFIED Requirements

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
