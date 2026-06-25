## MODIFIED Requirements

### Requirement: Admin-gated account creation with temp passwords
Students SHALL only receive login access after completing onboarding through a verified onboarding session and after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email and a cryptographically secure random 6-digit temporary PIN/password upon verified onboarding quiz completion, or reuse an existing auth user for the same email if one already exists. The temp PIN SHALL be displayed on the completion screen and emailed to the student only for the verified completing onboarding session. Admin approval SHALL certify the student and set access expiration from the selected class ride-time end date for class-linked students, while preserving legacy expiration behavior for unassigned existing students.

#### Scenario: Auth user created on verified onboarding completion
- **WHEN** a student completes the onboarding quiz and submits matching onboarding session proof for their student record
- **THEN** a Supabase Auth user is created with a cryptographically secure random 6-digit PIN/password, `students.auth_user_id` is set, and credentials are returned to the verified frontend session

#### Scenario: Existing auth user reused on verified onboarding completion
- **WHEN** a student completes onboarding with valid onboarding session proof and an auth user already exists for their email
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and no new password is generated

#### Scenario: Admin approves class-linked pending student
- **WHEN** an admin approves a submitted onboarding with `training_class_id` as part of daily ops
- **THEN** status is set to `certified`, `access_until` is set from the selected class `ride_time_end_date`, and no credential email is sent because the student already has credentials

#### Scenario: Admin approves unassigned pending student
- **WHEN** an admin approves a compatible pending student without `training_class_id` as part of daily ops
- **THEN** status is set to `certified`, legacy access expiration behavior is applied, and no credential email is sent because the student already has credentials

#### Scenario: Student cannot self-register for auth
- **WHEN** an unauthorized user attempts to access Supabase Auth sign-up endpoints directly
- **THEN** the request is rejected

#### Scenario: Unverified onboarding completion is rejected
- **WHEN** a caller submits onboarding completion for a student record without matching onboarding session proof
- **THEN** the system rejects the request before creating or linking any Supabase Auth user

### Requirement: Row Level Security on all tables
All database tables SHALL have Row Level Security (RLS) enabled. Students SHALL only read and write their own enrollment-scoped records by resolving `auth.uid()` through `students.auth_user_id`; related tables SHALL reference the immutable `students.id` enrollment id via EXISTS subqueries. Admin users SHALL have full `ALL` access to all tables via `user_metadata.role = 'admin'`. Public instructor registration SHALL not expose pending or inactive registry records, and student class selection SHALL expose only active currently visible classes.

The `students` table SHALL use `auth.uid() = auth_user_id` for student SELECT and UPDATE policies. The `schedules`, `evaluations`, `messages`, and `student_field_values` tables SHALL use EXISTS subqueries routing through `students.auth_user_id`. INSERT policies on `schedules`, `evaluations`, and `messages` SHALL additionally require `students.status = 'certified'` and `students.is_blacklisted = false`. Onboarding field value inserts SHALL require `students.status = 'pending'`. Registry tables SHALL restrict public/student reads to active visible class options only and SHALL allow admins to manage all records.

#### Scenario: Student queries own students record
- **WHEN** a student queries the students table by `auth_user_id`
- **THEN** the row where `auth_user_id` matches `auth.uid()` is returned

#### Scenario: Student queries own schedules
- **WHEN** a student queries the schedules table
- **THEN** only rows where `student_id` references a student row whose `auth_user_id` matches the authenticated UUID are returned

#### Scenario: Student inserts own schedule
- **WHEN** a certified, non-blacklisted student inserts a schedule row inside their permitted class date window
- **THEN** the insert succeeds because the associated student row passes the `status = 'certified'`, `is_blacklisted = false`, and class-window checks

#### Scenario: Pending student cannot insert schedule
- **WHEN** a pending student attempts to insert a schedule row
- **THEN** the insert is blocked because the EXISTS check requires `status = 'certified'`

#### Scenario: Student cannot view another student's records
- **WHEN** a student queries the schedules table filtering by another student's UUID
- **THEN** no rows are returned because the EXISTS check fails for a different student's `auth_user_id`

#### Scenario: Onboarding inserts field values for pending student
- **WHEN** a pending, non-blacklisted student inserts a student_field_values row
- **THEN** the insert succeeds because the EXISTS check requires `status = 'pending'` and `is_blacklisted = false`

#### Scenario: Public user cannot read pending class
- **WHEN** a public or student-facing class option request encounters a pending, rejected, suspended, archived, future-hidden, or expired class
- **THEN** that class is not returned

#### Scenario: Admin queries all records
- **WHEN** an admin queries any table
- **THEN** all rows are returned regardless of ownership or status
