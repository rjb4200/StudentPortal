## MODIFIED Requirements

### Requirement: Admin-gated account creation with temp passwords
Students SHALL only receive login access after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email and a random 6-digit temporary password upon onboarding quiz completion, or reuse an existing auth user for the same email if one already exists. The temp password SHALL be displayed on the completion screen and emailed to the student.

#### Scenario: Auth user created on onboarding completion
- **WHEN** a student completes the onboarding quiz and no existing auth user exists for their email
- **THEN** a Supabase Auth user is created with a random 6-digit password, `students.auth_user_id` is set, and credentials are returned to the frontend

#### Scenario: Existing auth user reused on onboarding completion
- **WHEN** a student completes onboarding and an auth user already exists for their email
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and no new password is generated

#### Scenario: Admin approves pending student
- **WHEN** an admin approves a submitted onboarding as part of daily ops
- **THEN** status is set to `certified`, `access_until` is set to 120 days from now, and no email is sent (student already has credentials)

#### Scenario: Student cannot self-register for auth
- **WHEN** an unauthorized user attempts to access Supabase Auth sign-up endpoints directly
- **THEN** the request is rejected

### Requirement: Password-based authentication for students
Students SHALL authenticate using email and password via Supabase Auth. The login page Student tab SHALL accept the student's email and password and validate the email against the `students` table before allowing sign-in. Authenticated students SHALL be redirected to `/dashboard`, where the student enrollment row is resolved by `students.auth_user_id = auth.uid()`.

#### Scenario: Password login
- **WHEN** a certified student enters their email and password on the login page Student tab and submits
- **THEN** Supabase authenticates the credentials, middleware verifies the student row, and the browser redirects to `/dashboard`

#### Scenario: Password login for pending student
- **WHEN** a pending student with a linked auth user enters their email and password
- **THEN** the middleware allows `/dashboard` access for the pending-approval view only

#### Scenario: Password login for expired student
- **WHEN** a student with an expired `access_until` timestamp authenticates
- **THEN** the middleware redirects them to `/onboarding` with an expired access message

#### Scenario: Password login for archived or blacklisted student
- **WHEN** a student with status `archived` or `is_blacklisted = true` authenticates
- **THEN** the middleware redirects them away from `/dashboard` with the appropriate onboarding status message

#### Scenario: No student account for email
- **WHEN** an email with no matching `students` row is entered on the Student tab
- **THEN** the user is redirected to `/onboarding`

#### Scenario: Forgot password
- **WHEN** a user clicks "Forgot password?" on the Student tab and enters their email
- **THEN** Supabase sends a password reset email to that address, and the user is directed to `/reset-password` to set a new password
