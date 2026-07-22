# admin-account-management

## Purpose

Unified account management for admin and preceptor accounts with password-based auth, per-account notification preferences, student record editing, and database-driven email recipient configuration.
## Requirements
### Requirement: Admin account management
The system SHALL allow admin users to create, edit, disable, and delete admin accounts from the Account Management page, including password-based authentication and per-account notification preferences.

#### Scenario: Create admin account
- **WHEN** an admin fills in full name, email, and password and clicks save
- **THEN** a Supabase Auth user is created with role `admin` and an `admin_accounts` row is inserted

#### Scenario: Edit admin notification preferences
- **WHEN** an admin edits another admin's notification toggles and saves
- **THEN** the preferences are updated and future notifications respect the new settings

#### Scenario: Disable admin account
- **WHEN** an admin disables an admin account
- **THEN** the auth user remains but the `admin_accounts.is_active` is set to false and they can no longer log in

#### Scenario: Delete admin account
- **WHEN** an admin deletes an admin account
- **THEN** the auth user is deleted and the `admin_accounts` row is removed

### Requirement: Preceptor account management
The system SHALL allow admin users to create, edit, disable, and delete preceptor accounts with password-based auth, profile info (name, station, bio, image, tags), and notification preferences.

#### Scenario: Create preceptor account
- **WHEN** an admin creates a preceptor with name, email, password, and station
- **THEN** a Supabase Auth user with role `preceptor` is created and linked to a `preceptors` row

#### Scenario: Preceptor login
- **WHEN** a preceptor enters email and password on the login page Admin tab
- **THEN** they are redirected to `/preceptor`

#### Scenario: Preceptor sees coming-soon dashboard
- **WHEN** a preceptor logs in
- **THEN** they see a coming-soon page at `/preceptor`

### Requirement: Student account editing
The system SHALL allow admin users to edit student personal information (name, email, phone, school, instructor, contact), status, blacklist flag, test-record flag, auth linkage, previous-student linkage, and no-show count from the Account Management page. Admin edits SHALL NOT change `students.id`.

#### Scenario: Edit student info
- **WHEN** an admin changes a student's name, email, or school information and saves
- **THEN** the student record is updated and changes reflect on the roster and dashboard

#### Scenario: Change student status
- **WHEN** an admin changes a student's status from pending to certified
- **THEN** the student's dashboard access is updated on next middleware check

#### Scenario: Archive student
- **WHEN** an admin changes a student's status to `archived`
- **THEN** the student can no longer access `/dashboard` and the historical row remains available to admins

#### Scenario: Manage test-record flag
- **WHEN** an admin marks or unmarks a student as a test record
- **THEN** the `is_test_record` value is updated without modifying the student's primary key or historical fields

#### Scenario: Student roster links to edit page
- **WHEN** an admin clicks a student name in the Daily Ops Student Roster
- **THEN** the browser navigates to `/admin/accounts?edit=<student-id>` with the student's edit form open

### Requirement: Notification recipient configuration
The system SHALL use per-account notification preferences from `admin_accounts` and `preceptors` to determine email recipients for system notifications, replacing hard-coded email addresses. Active admin accounts SHALL support an independently configurable student-message email notification preference. Active admin accounts SHALL support an independently configurable shift request email notification preference via the `notify_schedule_requested` toggle.

#### Scenario: Onboarding complete notification
- **WHEN** a student completes onboarding
- **THEN** emails are sent to all active admin accounts with `notify_onboarding_complete = true`

#### Scenario: Flagged evaluation notification
- **WHEN** an evaluation is submitted with overall rating less than 3
- **THEN** emails are sent to all active admin accounts with `notify_evaluation_flagged = true`

#### Scenario: Student-message notification preference
- **WHEN** an admin enables or disables student-message email notifications and saves the account
- **THEN** future student-message alerts include or exclude that active admin according to the saved preference

#### Scenario: Shift request notification preference
- **WHEN** an admin enables or disables shift request email notifications and saves the account
- **THEN** future student shift request notifications include or exclude that active admin according to the `notify_schedule_requested` preference

### Requirement: Long-lived admin and preceptor sessions
The system SHALL configure Supabase Auth JWT expiry to 1 year for admin and preceptor accounts so they rarely need to re-authenticate.

#### Scenario: Admin session persists
- **WHEN** an admin logs in
- **THEN** their session remains valid for up to 1 year without re-authentication

### Requirement: RLS for admin_accounts
The `admin_accounts` table SHALL have RLS enabled with admin-only read/write access.

#### Scenario: Admin reads all admin_accounts
- **WHEN** an admin queries `admin_accounts`
- **THEN** all rows are returned

#### Scenario: Non-admin blocked from admin_accounts
- **WHEN** a non-admin attempts to read or write `admin_accounts`
- **THEN** the operation is rejected

### Requirement: Admin-only test student reset
The system SHALL provide an explicit admin-only reset workflow for student records marked `is_test_record = true`. The reset workflow MUST NOT affect non-test student records.

#### Scenario: Reset test student by email
- **WHEN** an admin requests a test reset for an email that only matches records with `is_test_record = true`
- **THEN** the system clears or removes test-generated approval state, onboarding progress, schedules, messages, and related test-only records as appropriate

#### Scenario: Reset unlinks test auth user
- **WHEN** a test reset targets a test student with an associated `auth_user_id`
- **THEN** the system unlinks the auth user from the test student row and may delete the associated auth user when it is safe to do so

#### Scenario: Non-test reset blocked
- **WHEN** an admin requests a test reset for an email that matches any record with `is_test_record = false`
- **THEN** the test reset is rejected and no non-test student record or related historical data is modified

#### Scenario: Unauthenticated reset blocked
- **WHEN** a non-admin or unauthenticated user attempts to reset a test student
- **THEN** the request is rejected and no data is modified

### Requirement: Account Management operational UI pattern
The Account Management page SHALL use shared operational UI components for account tabs, account lists, edit forms, form feedback, loading states, and destructive confirmations while preserving existing account-management behavior.

#### Scenario: Admin switches account tabs
- **WHEN** an admin switches between admin, preceptor, and student account views
- **THEN** the tab controls use the shared tabs pattern and continue to show the selected account type's records

#### Scenario: Admin edits account form
- **WHEN** an admin creates or edits an admin, preceptor, or student account
- **THEN** the form uses shared form-field and section-card patterns while preserving validation, save behavior, and existing editable fields

#### Scenario: Admin performs destructive account action
- **WHEN** an admin disables, deletes, or resets an account through a migrated destructive flow
- **THEN** the flow uses the shared confirmation dialog and only performs the action after explicit confirmation

