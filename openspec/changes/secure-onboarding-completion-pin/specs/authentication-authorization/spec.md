## MODIFIED Requirements

### Requirement: Admin-gated account creation with temp passwords
Students SHALL only receive login access after completing onboarding through a verified onboarding session and after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email and a cryptographically secure random 6-digit temporary PIN/password upon verified onboarding quiz completion, or reuse an existing auth user for the same email if one already exists. The temp PIN SHALL be displayed on the completion screen and emailed to the student only for the verified completing onboarding session.

#### Scenario: Auth user created on verified onboarding completion
- **WHEN** a student completes the onboarding quiz and submits matching onboarding session proof for their student record
- **THEN** a Supabase Auth user is created with a cryptographically secure random 6-digit PIN/password, `students.auth_user_id` is set, and credentials are returned to the verified frontend session

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
