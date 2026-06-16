## MODIFIED Requirements

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
