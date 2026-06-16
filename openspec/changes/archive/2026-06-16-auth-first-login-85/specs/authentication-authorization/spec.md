## MODIFIED Requirements

### Requirement: Password-based authentication for students
Students SHALL authenticate using email and password via Supabase Auth. The login page Student tab SHALL accept the student's email and password and attempt `signInWithPassword` before performing any student-record lookup. After successful authentication, the system SHALL query the `students` table by `auth_user_id` to resolve the student record and check status. Authenticated students with a valid student record SHALL be redirected to `/dashboard`.

#### Scenario: Password login
- **WHEN** a certified student enters their email and password on the login page Student tab and submits
- **THEN** Supabase authenticates the credentials, the system queries `students` by `auth_user_id`, finds the certified record, and redirects to `/dashboard`

#### Scenario: Password login for pending student
- **WHEN** a pending student with a linked auth user enters their email and password
- **THEN** Supabase authenticates the credentials, the system queries `students` by `auth_user_id`, finds the pending record, and redirects to `/dashboard`

#### Scenario: Password login for expired student
- **WHEN** a student with an expired `access_until` timestamp authenticates
- **THEN** the system queries `students` by `auth_user_id`, finds the expired record, and displays the expired-access inline message on the login page

#### Scenario: Password login for archived or blacklisted student
- **WHEN** a student with status `archived` or `is_blacklisted = true` authenticates
- **THEN** the system queries `students` by `auth_user_id`, finds the record, and displays the appropriate inline status message on the login page

#### Scenario: No student account for email
- **WHEN** a user enters credentials that do not match any Supabase Auth user
- **THEN** the login page displays "Invalid email or password." with a "Don't have an account? Start Onboarding" link to `/onboarding`

#### Scenario: Auth succeeds but no linked student record
- **WHEN** a user authenticates successfully but no `students` row matches their `auth_user_id`
- **THEN** the login page displays "Your login account exists but no student registration is linked. Please complete onboarding." with a link to `/onboarding`

#### Scenario: Forgot password
- **WHEN** a user clicks "Forgot password?" on the Student tab and enters their email
- **THEN** Supabase sends a password reset email to that address, and the user is directed to `/reset-password` to set a new password
