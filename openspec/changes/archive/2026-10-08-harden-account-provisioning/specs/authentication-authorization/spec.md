## MODIFIED Requirements

### Requirement: Admin-gated account creation with temp passwords
Students SHALL only receive login access after completing onboarding through a verified onboarding session and after the Training Major approves their onboarding submission. The system SHALL create a Supabase Auth user with the student's email, a cryptographically secure random 6-digit temporary PIN/password, and protected `app_metadata.role = 'student'` upon verified onboarding quiz completion, or reuse an existing auth user for the same email only when that user has role `student`. If an auth user with a staff role already exists for the email, the system SHALL refuse and instruct the student to use a different email, keeping student and staff accounts separate. The temp PIN SHALL be displayed on the completion screen and emailed to the student only for the verified completing onboarding session.

#### Scenario: Auth user created on verified onboarding completion
- **WHEN** a student completes the onboarding quiz and submits matching onboarding session proof for their student record
- **THEN** a Supabase Auth user is created with a cryptographically secure random 6-digit PIN/password, `app_metadata.role = 'student'`, `students.auth_user_id` is set, and credentials are returned to the verified frontend session

#### Scenario: Existing student auth user reused on verified onboarding completion
- **WHEN** a student completes onboarding with valid onboarding session proof and an auth user already exists for their email with role `student`
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and no new password is generated

#### Scenario: Staff email refused for student onboarding
- **WHEN** a student completes onboarding with an email that already has a staff login
- **THEN** the system refuses, instructs the student to use a different email, and does not link the enrollment to the staff login

#### Scenario: Admin approves pending student
- **WHEN** an admin approves a submitted onboarding as part of daily ops
- **THEN** status is set to `certified`, `access_until` is set to 120 days from now, and no email is sent (student already has credentials)

#### Scenario: Student cannot self-register for auth
- **WHEN** an unauthorized user attempts to access Supabase Auth sign-up endpoints directly
- **THEN** the request is rejected

#### Scenario: Unverified onboarding completion is rejected
- **WHEN** a caller submits onboarding completion for a student record without matching onboarding session proof
- **THEN** the system rejects the request before creating or linking any Supabase Auth user

## ADDED Requirements

### Requirement: Separate student and staff accounts
The system SHALL treat student accounts and staff accounts as separate account families. A single email SHALL back exactly one family; a person who is both a student and staff SHALL use distinct emails for each account. The system SHALL NOT link a student record to a staff login or a staff record to a student login. Student access SHALL continue to be resolved by the `students` row whose `auth_user_id` matches the authenticated user.

#### Scenario: Both accounts under different emails
- **WHEN** a person holds a student account under one email and a staff account under another email
- **THEN** both accounts function independently and neither blocks creation or use of the other

#### Scenario: Staff email cannot create a student account
- **WHEN** onboarding completes for an email that already has a staff login
- **THEN** the enrollment is not linked to the staff login and the student is told to use a different email

#### Scenario: Student email cannot create a staff account
- **WHEN** an admin creates a staff account for an email used by a student record
- **THEN** the operation is refused and the admin is told to use a different email

#### Scenario: Staff role ceiling unchanged
- **WHEN** an auth user has `app_metadata.role = 'admin'`
- **THEN** the user is authorized for the Preceptor area in addition to the Admin area

## REMOVED Requirements

### Requirement: Orthogonal student enrollment and staff role
**Reason**: Superseded by the separate-accounts model. A single login SHALL NOT hold both a student enrollment and a staff role; student and staff accounts are separate families using distinct emails.
**Migration**: Use distinct emails for a person's student and staff accounts. Any existing single-login dual-role data is out of scope for this change.
