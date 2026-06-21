## MODIFIED Requirements

### Requirement: Quiz completion creates auth user with temp password
The system SHALL create or reuse a Supabase Auth user with a cryptographically secure random 6-digit temporary PIN/password when the onboarding quiz is completed through a verified onboarding session. Completion SHALL link the auth user to the student enrollment through `students.auth_user_id`, set `students.onboarding_completed_at` to a server-generated timestamp, and SHALL NOT change `students.id`. Auth user creation, auth linking, and completion timestamp recording SHALL succeed independently of notification email delivery — the temp PIN SHALL always be returned in the API response payload when auth setup succeeds for the verified onboarding session.

#### Scenario: Quiz completed by new student
- **WHEN** a student completes the onboarding quiz and the notification API is called with matching onboarding session proof
- **THEN** a Supabase Auth user is created for the student's email with a cryptographically secure random 6-digit PIN/password
- **AND** `students.auth_user_id` is set to that auth user id
- **AND** `students.onboarding_completed_at` is set to a non-null server timestamp
- **AND** the temp PIN is returned to the verified frontend session

#### Scenario: Quiz completed by re-registering student
- **WHEN** a student completes the quiz with matching onboarding session proof and an auth user already exists for their email
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and a null password is returned (student uses existing credentials)
- **AND** `students.onboarding_completed_at` is set to a non-null server timestamp

#### Scenario: Quiz completion preserves enrollment identity
- **WHEN** onboarding completion links or reuses an auth user
- **THEN** the student's existing `students.id` value remains unchanged and related enrollment-scoped records continue to reference the same student id

#### Scenario: Quiz complete spinner stops
- **WHEN** the Finish Onboarding button is clicked and the API call completes
- **THEN** the spinner stops and the onboarding continues to the completion screen

#### Scenario: Email provider fails during onboarding completion
- **WHEN** a student completes onboarding with matching onboarding session proof and the Resend API is unreachable
- **THEN** the auth user is still created and linked, `students.onboarding_completed_at` is recorded, the API returns HTTP 200 with the temp PIN, and the email failure is logged without exposing the PIN in logs
- **AND** the frontend displays the PIN to the student on the completion screen

#### Scenario: API returns error for auth creation failure
- **WHEN** the notification API is called with matching onboarding session proof but auth user creation fails (not an email failure)
- **THEN** the API returns `{ success: false }` with an error message
- **AND** the frontend displays the error and allows the student to retry
- **AND** `students.onboarding_completed_at` remains null

#### Scenario: API rejects missing or invalid onboarding proof
- **WHEN** the notification API is called without matching onboarding session proof for the submitted student id
- **THEN** the API returns an authorization error before auth user creation, auth linking, notification email delivery, or completion timestamp recording
- **AND** the frontend displays a clear session verification error with restart/help guidance
