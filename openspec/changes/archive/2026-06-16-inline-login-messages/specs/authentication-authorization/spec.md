## MODIFIED Requirements

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
- **THEN** the middleware redirects them to `/login?reason=expired` where the login page displays the expired access message

#### Scenario: Password login for archived or blacklisted student
- **WHEN** a student with status `archived` or `is_blacklisted = true` authenticates
- **THEN** the middleware redirects them to `/login?reason=archived` or `/login?reason=blacklisted` where the login page displays the appropriate status message

#### Scenario: No student account for email
- **WHEN** an email with no matching `students` row is entered on the Student tab
- **THEN** the login page displays an inline warning message with a link to `/onboarding` and does not redirect

#### Scenario: Forgot password
- **WHEN** a user clicks "Forgot password?" on the Student tab and enters their email
- **THEN** Supabase sends a password reset email to that address, and the user is directed to `/reset-password` to set a new password

### Requirement: Session timeout on access expiration
The system middleware SHALL evaluate the active student row resolved by `students.auth_user_id`. If the student is blacklisted, archived, or has an `access_until` timestamp in the past, the session SHALL be blocked and the student redirected to `/login` with the appropriate `reason` query parameter.

#### Scenario: Active session during valid access window
- **WHEN** an authenticated student with `status = 'certified'`, `is_blacklisted = false`, and `access_until` in the future makes a request to `/dashboard`
- **THEN** the request is served normally

#### Scenario: Session blocked after access expiry
- **WHEN** an authenticated student with `access_until` in the past makes a request to `/dashboard`
- **THEN** the session is blocked and the student is redirected to `/login?reason=expired`

#### Scenario: Session blocked for archived student
- **WHEN** an authenticated student with `status = 'archived'` makes a request to `/dashboard`
- **THEN** the session is blocked and the student is redirected to `/login?reason=archived`

#### Scenario: Session blocked for blacklisted student
- **WHEN** an authenticated student with `is_blacklisted = true` makes a request to `/dashboard`
- **THEN** the session is blocked and the student is redirected to `/login?reason=blacklisted`

#### Scenario: Session blocked when no student record matches
- **WHEN** an authenticated user with no matching `students` row by `auth_user_id` makes a request to `/dashboard`
- **THEN** the session is blocked and the user is redirected to `/login?reason=not-registered`
