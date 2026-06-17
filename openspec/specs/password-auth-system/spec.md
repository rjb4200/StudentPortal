## Purpose

Password-based student authentication replacing the deprecated magic link system.

## Requirements

### Requirement: Temporary password generation on onboarding
The system SHALL create a Supabase Auth user with a random 6-digit temporary password when a student completes the onboarding quiz, or reuse an existing auth user for the same email if one already exists.

#### Scenario: New student completes onboarding
- **WHEN** a student with no existing auth user completes the onboarding quiz
- **THEN** a Supabase Auth user is created with a random 6-digit password and the credentials are returned to the frontend

#### Scenario: Student with existing auth account
- **WHEN** a student whose email already has an auth user (admin or preceptor) completes onboarding
- **THEN** the existing auth user is reused, no password change is forced, and null is returned for the password

### Requirement: Onboarding completion shows credentials
The onboarding completion screen SHALL display the student's email and temporary password, or instruct them to use existing credentials if no new password was generated.

#### Scenario: Display temporary credentials
- **WHEN** a new student completes onboarding and a temp password was generated
- **THEN** the completion screen shows the email and 6-digit password with instructions to save them

#### Scenario: Display existing credentials message
- **WHEN** a student completes onboarding and an existing auth account was reused
- **THEN** the completion screen says "Use your existing WFD credentials to log in once approved"

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
