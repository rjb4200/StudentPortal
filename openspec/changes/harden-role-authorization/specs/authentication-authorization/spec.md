## MODIFIED Requirements

### Requirement: Role-based access control
The system SHALL distinguish between student, preceptor, and admin roles using protected Supabase Auth `app_metadata.role`. Admin accounts SHALL have full access to `/admin` and all admin data. Preceptor accounts SHALL NOT access `/admin`; they SHALL access only the Preceptor area when that area exists. Admin accounts SHALL also be allowed to open the Preceptor area for oversight and troubleshooting. Student accounts SHALL only access `/dashboard` and their own data. The system SHALL NOT use user-editable `user_metadata.role` for authorization decisions.

#### Scenario: Student accesses admin route
- **WHEN** a student attempts to navigate to `/admin`
- **THEN** the system returns a 403 Forbidden response or redirects away from `/admin`

#### Scenario: Preceptor accesses admin route
- **WHEN** a preceptor attempts to navigate to `/admin` or any `/admin/*` route
- **THEN** the system denies access before rendering admin UI

#### Scenario: Admin accesses admin route
- **WHEN** an authenticated admin with `app_metadata.role = 'admin'` navigates to `/admin`
- **THEN** the admin command center is rendered

#### Scenario: Preceptor accesses preceptor route
- **WHEN** an authenticated preceptor with `app_metadata.role = 'preceptor'` navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin accesses preceptor route
- **WHEN** an authenticated admin with `app_metadata.role = 'admin'` navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin API rejects non-admin roles
- **WHEN** a preceptor, student, unauthenticated user, or any non-admin role calls an `/api/admin/*` route
- **THEN** the API returns a forbidden response and does not perform the admin action

#### Scenario: User metadata role is ignored
- **WHEN** an authenticated user has `user_metadata.role = 'admin'` but does not have `app_metadata.role = 'admin'`
- **THEN** the user is not authorized as an admin

### Requirement: Row Level Security on all tables
All database tables SHALL have Row Level Security (RLS) enabled. Students SHALL only read and write their own enrollment-scoped records by resolving `auth.uid()` through `students.auth_user_id`; related tables SHALL reference the immutable `students.id` enrollment id via EXISTS subqueries. Admin users SHALL have full `ALL` access to admin-managed tables via protected `app_metadata.role = 'admin'` claims in `auth.jwt()`. RLS policies SHALL NOT use user-editable `user_metadata.role` for authorization.

The `students` table SHALL use `auth.uid() = auth_user_id` for student SELECT and UPDATE policies. The `schedules`, `evaluations`, `messages`, and `student_field_values` tables SHALL use EXISTS subqueries routing through `students.auth_user_id`. INSERT policies on `schedules`, `evaluations`, and `messages` SHALL additionally require `students.status = 'certified'` and `students.is_blacklisted = false`. Onboarding field value inserts SHALL require `students.status = 'pending'`.

#### Scenario: Student queries own students record
- **WHEN** a student queries the students table by `auth_user_id`
- **THEN** the row where `auth_user_id` matches `auth.uid()` is returned

#### Scenario: Student queries own schedules
- **WHEN** a student queries the schedules table
- **THEN** only rows where `student_id` references a student row whose `auth_user_id` matches the authenticated UUID are returned

#### Scenario: Student inserts own schedule
- **WHEN** a certified, non-blacklisted student inserts a schedule row
- **THEN** the insert succeeds because the associated student row passes the `status = 'certified'` and `is_blacklisted = false` checks

#### Scenario: Pending student cannot insert schedule
- **WHEN** a pending student attempts to insert a schedule row
- **THEN** the insert is blocked because the EXISTS check requires `status = 'certified'`

#### Scenario: Student cannot view another student's records
- **WHEN** a student queries the schedules table filtering by another student's UUID
- **THEN** no rows are returned because the EXISTS check fails for a different student's `auth_user_id`

#### Scenario: Onboarding inserts field values for pending student
- **WHEN** a pending, non-blacklisted student inserts a student_field_values row
- **THEN** the insert succeeds because the EXISTS check requires `status = 'pending'` and `is_blacklisted = false`

#### Scenario: Admin queries all records
- **WHEN** an admin with `app_metadata.role = 'admin'` queries any admin-managed table
- **THEN** all rows are returned regardless of ownership or status

#### Scenario: User metadata admin claim is rejected by RLS
- **WHEN** a user has `user_metadata.role = 'admin'` but lacks `app_metadata.role = 'admin'`
- **THEN** admin RLS policies do not grant admin access

### Requirement: Admin-gated account creation with temp passwords
Students SHALL only receive login access after completing onboarding through a verified onboarding session and after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email, a cryptographically secure random 6-digit temporary PIN/password, and protected `app_metadata.role = 'student'` upon verified onboarding quiz completion, or reuse an existing auth user for the same email if one already exists. The temp PIN SHALL be displayed on the completion screen and emailed to the student only for the verified completing onboarding session.

#### Scenario: Auth user created on verified onboarding completion
- **WHEN** a student completes the onboarding quiz and submits matching onboarding session proof for their student record
- **THEN** a Supabase Auth user is created with a cryptographically secure random 6-digit PIN/password, `app_metadata.role = 'student'`, `students.auth_user_id` is set, and credentials are returned to the verified frontend session

#### Scenario: Existing auth user reused on verified onboarding completion
- **WHEN** a student completes onboarding with valid onboarding session proof and an auth user already exists for their email
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and no new password is generated

#### Scenario: Admin approves pending student
- **WHEN** an admin approves a submitted onboarding as part of daily ops
- **THEN** status is set to `certified`, `access_until` is set to 120 days from now, and no email is sent (student already has credentials)

#### Scenario: Student cannot self-register for auth
- **WHEN** an unauthorized user attempts to access Supabase Auth sign-up endpoints directly
- **THEN** the request is rejected

#### Scenario: Unverified onboarding completion is rejected
- **WHEN** a caller submits onboarding completion for a student record without matching onboarding session proof
- **THEN** the system rejects the request before creating or linking any Supabase Auth user

### Requirement: Admin email/password authentication
Admin accounts (Training Major and EMS Assistant Chief) SHALL authenticate using email and password via Supabase Auth. Admin accounts SHALL be pre-created with protected `app_metadata.role = 'admin'` and SHALL NOT be available for self-service sign-up.

#### Scenario: Admin login
- **WHEN** an admin enters their email and password on the login page
- **THEN** Supabase authenticates the credentials and the middleware redirects to `/admin`

#### Scenario: Failed admin login
- **WHEN** an admin enters incorrect credentials
- **THEN** Supabase returns an authentication error and the login page displays an error message

#### Scenario: Admin account role is protected
- **WHEN** an admin Auth account is created or updated by a privileged server route
- **THEN** the admin role is stored in `app_metadata.role`, not `user_metadata.role`
