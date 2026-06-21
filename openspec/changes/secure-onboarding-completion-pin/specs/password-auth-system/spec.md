## MODIFIED Requirements

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
