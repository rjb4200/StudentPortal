## Purpose

Password-based student authentication replacing the deprecated magic link system.

## Requirements

### Requirement: Temporary password generation on onboarding
The system SHALL create a Supabase Auth user with a cryptographically secure random 6-digit temporary PIN/password when a student completes the onboarding quiz through a verified onboarding session, or reuse an existing auth user for the same email if one already exists.

#### Scenario: New student completes onboarding
- **WHEN** a student with no existing auth user completes the onboarding quiz with matching onboarding session proof
- **THEN** a Supabase Auth user is created with a cryptographically secure random 6-digit PIN/password and the credentials are returned to the verified frontend session

#### Scenario: Student with existing auth account
- **WHEN** a student whose email already has an auth user (admin or preceptor) completes onboarding with matching onboarding session proof
- **THEN** the existing auth user is reused, no password change is forced, and null is returned for the password

#### Scenario: Unverified completion cannot generate credentials
- **WHEN** a caller attempts onboarding completion without matching onboarding session proof
- **THEN** no temporary PIN/password is generated or returned

### Requirement: Onboarding completion shows credentials
The onboarding completion screen SHALL display the student's email and temporary PIN/password returned to the verified onboarding session, or instruct them to use existing credentials if no new password was generated.

#### Scenario: Display temporary credentials
- **WHEN** a new student completes onboarding with matching onboarding session proof and a temp PIN/password was generated
- **THEN** the completion screen shows the email and 6-digit PIN/password with instructions to save them

#### Scenario: Display existing credentials message
- **WHEN** a student completes onboarding with matching onboarding session proof and an existing auth account was reused
- **THEN** the completion screen says "Use your existing WFD credentials to log in once approved"

#### Scenario: Verification error message
- **WHEN** onboarding completion fails because the session proof is missing, expired, mismatched, or consumed
- **THEN** the completion screen does not show credentials and instead displays a clear restart/help message

### Requirement: Password-based student login
The system SHALL accept email and password on the login page Student tab and validate against the students table before allowing access.

#### Scenario: Student logs in with correct credentials
- **WHEN** a student enters valid email and password on the Student tab
- **THEN** they are authenticated and redirected to the dashboard

#### Scenario: No student account for email
- **WHEN** an email with no matching students row is used on the Student tab
- **THEN** an error message is displayed: "No student account found for this email"

#### Scenario: Forgot password
- **WHEN** a user clicks "Forgot password?" and enters their email
- **THEN** a password reset email is sent and they are directed to the /reset-password page

### Requirement: Admin approval no longer sends magic link
The admin approval API route SHALL update the student's status and access expiry without sending an email, since the student already has credentials.

#### Scenario: Admin approves pending student
- **WHEN** an admin approves a pending student
- **THEN** the student's status is set to certified with a 120-day access expiry, and no email is sent
