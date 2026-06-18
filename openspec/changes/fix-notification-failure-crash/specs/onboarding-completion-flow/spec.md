## MODIFIED Requirements

### Requirement: Quiz completion creates auth user with temp password
The system SHALL create or reuse a Supabase Auth user with a random 6-digit temporary password when the onboarding quiz is completed. Completion SHALL link the auth user to the student enrollment through `students.auth_user_id` and SHALL NOT change `students.id`. Auth user creation and linking SHALL succeed independently of notification email delivery — the temp password SHALL always be returned in the API response payload.

#### Scenario: Quiz completed by new student
- **WHEN** a student completes the onboarding quiz and the notification API is called
- **THEN** a Supabase Auth user is created for the student's email with a random 6-digit password, `students.auth_user_id` is set to that auth user id, and the temp password is returned to the frontend

#### Scenario: Quiz completed by re-registering student
- **WHEN** a student completes the quiz and an auth user already exists for their email
- **THEN** creation is skipped, the current enrollment row is linked through `students.auth_user_id`, and a null password is returned (student uses existing credentials)

#### Scenario: Quiz completion preserves enrollment identity
- **WHEN** onboarding completion links or reuses an auth user
- **THEN** the student's existing `students.id` value remains unchanged and related enrollment-scoped records continue to reference the same student id

#### Scenario: Quiz complete spinner stops
- **WHEN** the Finish Onboarding button is clicked and the API call completes
- **THEN** the spinner stops and the onboarding continues to the completion screen

#### Scenario: Email provider fails during onboarding completion
- **WHEN** a student completes onboarding and the Resend API is unreachable
- **THEN** the auth user is still created and linked, the API returns HTTP 200 with the temp password, and the email failure is logged
- **AND** the frontend displays the password to the student on the completion screen

#### Scenario: API returns error for auth creation failure
- **WHEN** the notification API is called but auth user creation fails (not an email failure)
- **THEN** the API returns `{ success: false }` with an error message
- **AND** the frontend displays the error and allows the student to retry
