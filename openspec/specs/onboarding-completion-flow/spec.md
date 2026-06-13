# onboarding-completion-flow

**Purpose:** End-to-end onboarding completion experience including auth user creation on quiz finish, magic link delivery, admin-configurable completion screen, pending-approval dashboard, and login email validation.

## ADDED Requirements

### Requirement: Quiz completion sends auth magic link
The system SHALL create a Supabase Auth user and send a magic link email to the student immediately when the onboarding quiz is completed.

#### Scenario: Quiz completed by new student
- **WHEN** a student completes the onboarding quiz and the notification API is called
- **THEN** a Supabase Auth user is created for the student's email and a magic link is sent

#### Scenario: Quiz completed by re-registering student
- **WHEN** a student completes the quiz and an auth user already exists for their email
- **THEN** creation is skipped and a magic link is sent to the existing auth user

#### Scenario: Quiz complete spinner stops
- **WHEN** the Finish Onboarding button is clicked and the API call completes
- **THEN** the spinner stops and the onboarding continues to the completion screen

### Requirement: Admin-configurable completion screen
The system SHALL display an onboarding completion screen after the quiz that renders admin-configurable text from the database.

#### Scenario: Active completion message configured
- **WHEN** a student reaches the completion step and a completion template is active
- **THEN** the admin-configured title and body text are displayed

#### Scenario: No completion message active
- **WHEN** a student reaches the completion step and no completion template is active
- **THEN** a default completion message is displayed

#### Scenario: Admin edits completion message
- **WHEN** an admin edits the completion message on the setup page
- **THEN** future students see the updated text on the completion screen

### Requirement: Pending student dashboard access
The system SHALL allow students with `status = 'pending'` who have an auth account to access the dashboard, displaying a pending-approval message with calendar link instructions.

#### Scenario: Pending student logs in
- **WHEN** a pending student logs in via magic link
- **THEN** the dashboard displays the pending-approval message with the iCal feed link

#### Scenario: Pending dashboard limits
- **WHEN** a pending student views the dashboard
- **THEN** they see the pending message and calendar link but cannot access schedule requests, evaluation forms, or preceptor profiles

#### Scenario: Pending student approved
- **WHEN** an admin approves a pending student
- **THEN** the student's dashboard upgrades to the full certified view on next login

### Requirement: Login email validation
The system SHALL validate the entered email against the students table before sending a magic link on the login page.

#### Scenario: Registered student requests magic link
- **WHEN** a student with a valid `students` row enters their email on the login page
- **THEN** a magic link is sent

#### Scenario: Unregistered email on login
- **WHEN** an email that does not exist in the `students` table is entered on the login page
- **THEN** the user is redirected to the onboarding page

#### Scenario: Expired or blacklisted student on login
- **WHEN** a student with status `expired` or `is_blacklisted = true` enters their email on the login page
- **THEN** the user is redirected to the onboarding page with the appropriate status query parameter
