## Purpose

Define authentication, authorization, role-based access control, and student access enforcement for the portal.
## Requirements
### Requirement: Admin-gated account creation with magic links
Students SHALL only receive login access after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email upon approval and SHALL trigger a magic link email for passwordless authentication.

#### Scenario: Auth user created on approval
- **WHEN** an admin approves a student
- **THEN** a Supabase Auth user is created with the student's email via the service role API, status is set to `certified`, `access_until` is set to 120 days from now, and a magic link email is sent to the student

#### Scenario: Student cannot self-register for auth
- **WHEN** an unauthorized user attempts to access Supabase Auth sign-up endpoints directly
- **THEN** the request is rejected

### Requirement: Magic link authentication for students
Students SHALL authenticate using Supabase magic links sent to their registered email. The login page SHALL accept the student's email and trigger a one-time magic link. Clicking the link in the email SHALL establish an authenticated session and redirect the student to `/dashboard`, where the student enrollment row is resolved by `students.auth_user_id = auth.uid()`.

#### Scenario: Magic link login
- **WHEN** a certified student enters their email on the login page and submits
- **THEN** Supabase sends a magic link email to that address; clicking the link creates a session and redirects to `/dashboard`

#### Scenario: Magic link login for pending student
- **WHEN** a pending student enters their email and clicks the magic link
- **THEN** the middleware allows `/dashboard` access for the pending-approval view only

#### Scenario: Magic link login for expired student
- **WHEN** a student with an expired `access_until` timestamp clicks a magic link
- **THEN** the middleware redirects them to `/onboarding` with an expired access message

#### Scenario: Magic link login for archived or blacklisted student
- **WHEN** a student with status `archived` or `is_blacklisted = true` clicks a magic link
- **THEN** the middleware redirects them away from `/dashboard` with the appropriate onboarding status message

### Requirement: Admin email/password authentication
Admin accounts (Training Major and EMS Assistant Chief) SHALL authenticate using email and password via Supabase Auth. Admin accounts SHALL be pre-created and SHALL NOT be available for self-service sign-up.

#### Scenario: Admin login
- **WHEN** an admin enters their email and password on the login page
- **THEN** Supabase authenticates the credentials and the middleware redirects to `/admin`

#### Scenario: Failed admin login
- **WHEN** an admin enters incorrect credentials
- **THEN** Supabase returns an authentication error and the login page displays an error message

### Requirement: Role-based access control
The system SHALL distinguish between student, preceptor, and admin roles. Admin accounts SHALL have full access to `/admin` and all admin data. Preceptor accounts SHALL NOT access `/admin`; they SHALL access only the Preceptor area when that area exists. Admin accounts SHALL also be allowed to open the Preceptor area for oversight and troubleshooting. Student accounts SHALL only access `/dashboard` and their own data.

#### Scenario: Student accesses admin route
- **WHEN** a student attempts to navigate to `/admin`
- **THEN** the system returns a 403 Forbidden response or redirects away from `/admin`

#### Scenario: Preceptor accesses admin route
- **WHEN** a preceptor attempts to navigate to `/admin` or any `/admin/*` route
- **THEN** the system denies access before rendering admin UI

#### Scenario: Admin accesses admin route
- **WHEN** an authenticated admin navigates to `/admin`
- **THEN** the admin command center is rendered

#### Scenario: Preceptor accesses preceptor route
- **WHEN** an authenticated preceptor navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin accesses preceptor route
- **WHEN** an authenticated admin navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin API rejects non-admin roles
- **WHEN** a preceptor, student, unauthenticated user, or any non-admin role calls an `/api/admin/*` route
- **THEN** the API returns a forbidden response and does not perform the admin action

### Requirement: Row Level Security on all tables
All database tables SHALL have Row Level Security (RLS) enabled. Students SHALL only read and write their own enrollment-scoped records by resolving `auth.uid()` through `students.auth_user_id`; related tables SHALL continue to reference the immutable `students.id` enrollment id. Admin users SHALL have full `ALL` access to all tables.

#### Scenario: Student queries own records
- **WHEN** a student queries the schedules table
- **THEN** only rows where `student_id` references a student row whose `auth_user_id` matches the authenticated UUID are returned

#### Scenario: Student attempts to query another student's records
- **WHEN** a student queries the schedules table with another student's UUID
- **THEN** no rows are returned

#### Scenario: Admin queries all records
- **WHEN** an admin queries the schedules table
- **THEN** all rows are returned regardless of `student_id`

### Requirement: Separate admin accounts with identical permissions
The Training Major and EMS Assistant Chief SHALL have separate Supabase Auth accounts. Both SHALL have identical permission sets granting full access to admin functionality.

#### Scenario: Different admin accounts, same access
- **WHEN** the EMS Assistant Chief logs in to `/admin`
- **THEN** the same admin command center is rendered as for the Training Major, with identical data visibility and action capabilities

### Requirement: Session timeout on access expiration
The system middleware SHALL evaluate the active student row resolved by `students.auth_user_id`. If the student is blacklisted, archived, or has an `access_until` timestamp in the past, the session SHALL be terminated or blocked and the student redirected to `/onboarding`.

#### Scenario: Active session during valid access window
- **WHEN** an authenticated student with `status = 'certified'`, `is_blacklisted = false`, and `access_until` in the future makes a request to `/dashboard`
- **THEN** the request is served normally

#### Scenario: Session blocked after access expiry
- **WHEN** an authenticated student with `access_until` in the past makes a request to `/dashboard`
- **THEN** the session is terminated and the student is redirected to `/onboarding` with an expired access message

#### Scenario: Session blocked for archived student
- **WHEN** an authenticated student with `status = 'archived'` makes a request to `/dashboard`
- **THEN** the session is blocked and the student is redirected to `/onboarding` with an archived access message

