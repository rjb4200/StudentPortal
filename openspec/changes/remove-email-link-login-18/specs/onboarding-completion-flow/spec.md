## MODIFIED Requirements

### Requirement: Quiz completion creates auth user with temp password
The system SHALL create or reuse a Supabase Auth user with a random 6-digit temporary password when the onboarding quiz is completed. Completion SHALL link the auth user to the student enrollment through `students.auth_user_id` and SHALL NOT change `students.id`.

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

### Requirement: Admin-configurable completion screen
The system SHALL display an onboarding completion screen after the quiz that renders admin-configurable text from the database. When no admin template is active, the screen SHALL display the student's email and temporary password, or instruct them to use existing credentials if no new password was generated.

#### Scenario: Active completion message configured
- **WHEN** a student reaches the completion step and a completion template is active
- **THEN** the admin-configured title and body text are displayed

#### Scenario: No completion message active with temp password
- **WHEN** a new student reaches the completion step with a generated temp password and no completion template is active
- **THEN** a default completion message with the email and 6-digit password is displayed with instructions to save them

#### Scenario: No completion message active with existing auth
- **WHEN** a student with an existing auth account reaches the completion step and no completion template is active
- **THEN** a default message is displayed instructing them to use their existing WFD credentials

#### Scenario: Admin edits completion message
- **WHEN** an admin edits the completion message on the setup page
- **THEN** future students see the updated text on the completion screen

### Requirement: Pending student dashboard access
The system SHALL allow students with `status = 'pending'` who have an auth account linked by `students.auth_user_id` to access the dashboard, displaying a pending-approval message with calendar link instructions.

#### Scenario: Pending student logs in
- **WHEN** a pending student logs in with email and password
- **THEN** the dashboard resolves the student row by `auth_user_id` and displays the pending-approval message with the iCal feed link

#### Scenario: Pending dashboard limits
- **WHEN** a pending student views the dashboard
- **THEN** they see the pending message and calendar link but cannot access schedule requests, evaluation forms, or preceptor profiles

#### Scenario: Pending student approved
- **WHEN** an admin approves a pending student
- **THEN** the student's dashboard upgrades to the full certified view on next login

### Requirement: Login email validation
The system SHALL validate the entered email against eligible students table rows before allowing password-based sign-in on the login page.

#### Scenario: Registered student enters login credentials
- **WHEN** a student with a valid active or pending `students` row enters their email and password on the login page
- **THEN** Supabase authenticates the credentials and the browser redirects to `/dashboard`

#### Scenario: Unregistered email on login
- **WHEN** an email that does not exist in the `students` table is entered on the login page
- **THEN** the user is redirected to the onboarding page

#### Scenario: Expired archived or blacklisted student on login
- **WHEN** a student with status `expired`, status `archived`, or `is_blacklisted = true` enters their email on the login page
- **THEN** the user is redirected to the onboarding page with the appropriate status query parameter
