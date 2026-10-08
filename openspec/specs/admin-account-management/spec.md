# admin-account-management

## Purpose

Unified account management for admin and preceptor accounts with password-based auth, per-account notification preferences, student record editing, and database-driven email recipient configuration.
## Requirements
### Requirement: Admin account management
The system SHALL allow admin users to create, edit, disable, and delete admin accounts from the Account Management page, including password-based authentication and per-account notification preferences. Creating an admin account SHALL be a single server-side operation that provisions or replaces the Supabase Auth login and inserts the `admin_accounts` row, and SHALL NOT leave an orphaned auth user when the profile insert fails. Student and staff accounts SHALL remain separate: an email used by a student record SHALL NOT be used for an admin account.

#### Scenario: Create admin account
- **WHEN** an admin fills in full name, email, rank, and password and clicks save
- **THEN** an admin login is created with role `admin`, an `admin_accounts` row is inserted and linked via `auth_user_id`, and no orphaned auth user remains if either step fails

#### Scenario: Replace an unlinked existing staff login
- **WHEN** an admin creates an admin account whose email has an unlinked auth login in the staff family
- **THEN** the existing login is deleted and recreated with role `admin` and the entered password, and linked to the new `admin_accounts` row

#### Scenario: Escalating a preceptor login to admin requires confirmation
- **WHEN** an admin creates an admin account for an unlinked login whose role is `preceptor`
- **THEN** the system requires an explicit confirmation before replacing the login and changing its role to `admin`, and applies the change only after confirmation

#### Scenario: Student email cannot back an admin account
- **WHEN** an admin creates an admin account whose email is used by a student record
- **THEN** the operation is refused and the admin is instructed to use a different email, and no student or staff record is modified

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
The system SHALL allow admin users to create, edit, disable, and delete preceptor accounts with password-based auth, profile info (name, station, bio, image, tags), and notification preferences. Creating a preceptor account SHALL be a single server-side operation that provisions or replaces the Supabase Auth login and inserts the `preceptors` row, and SHALL NOT leave an orphaned auth user when the profile insert fails. Student and staff accounts SHALL remain separate: an email used by a student record SHALL NOT be used for a preceptor account.

#### Scenario: Create preceptor account
- **WHEN** an admin creates a preceptor with name, email, password, and station
- **THEN** a preceptor login is created with role `preceptor`, linked to a `preceptors` row, and no orphaned auth user remains if either step fails

#### Scenario: Replace an unlinked existing staff login
- **WHEN** an admin creates a preceptor account whose email has an unlinked auth login in the staff family
- **THEN** the existing login is deleted and recreated with role `preceptor` and the entered password, and linked to the new `preceptors` row

#### Scenario: Changing a staff login's role requires confirmation
- **WHEN** an admin creates a preceptor account for an unlinked login whose role is `admin`
- **THEN** the system requires an explicit confirmation before replacing the login and changing its role to `preceptor`

#### Scenario: Student email cannot back a preceptor account
- **WHEN** an admin creates a preceptor account whose email is used by a student record
- **THEN** the operation is refused and the admin is instructed to use a different email

#### Scenario: Preceptor login
- **WHEN** a preceptor enters email and password on the login page Admin tab
- **THEN** they are redirected to `/preceptor`

#### Scenario: Preceptor sees coming-soon dashboard
- **WHEN** a preceptor logs in
- **THEN** they see a coming-soon page at `/preceptor`

### Requirement: Self-healing account provisioning
The system SHALL provision admin and preceptor accounts atomically from the user's perspective by performing auth-login handling and profile-row insertion in a single server-side operation. The profile row SHALL be created before the auth login, and if auth-login creation or linking fails the operation SHALL report failure without reserving the email. When an unlinked staff login already exists for the email, the system SHALL replace it (delete and recreate) rather than adopt it, so the requested role and password apply.

#### Scenario: Profile insert precedes auth login creation
- **WHEN** an admin submits a new admin or preceptor account
- **THEN** the system inserts the profile row first so that a duplicate email is detected before any auth login is created

#### Scenario: Unlinked staff login is replaced
- **WHEN** an admin creates a staff account whose email has an unlinked auth login
- **THEN** the login is deleted and recreated with the requested role and password, and linked to the new profile row

#### Scenario: Failure during provisioning leaves no orphan
- **WHEN** profile-row creation succeeds but the subsequent auth-login creation or link fails
- **THEN** the operation reports the error and the email is not left reserved by an orphaned auth login

#### Scenario: Compensation removes only the operation's own auth login
- **WHEN** the operation created an auth login in this request and then must roll back
- **THEN** only that newly created login is deleted, and any pre-existing login is left untouched

### Requirement: Email ownership and role safety during provisioning
The system SHALL determine account ownership before creating or replacing an auth login, and SHALL NOT change a role without an explicit confirmation. Student and staff accounts SHALL NOT be merged: a role change across the student/staff boundary SHALL be refused. Role changes within the staff family (preceptor ↔ admin) SHALL be permitted only with explicit confirmation.

#### Scenario: Staff role change requires confirmation
- **WHEN** the existing login's staff role differs from the requested role
- **THEN** the system requires an explicit confirmation and does not change the role without it

#### Scenario: Cross-family change is refused
- **WHEN** an email is used by a student record and an admin attempts to create a staff account, or a staff login exists and onboarding attempts to enroll a student
- **THEN** the system refuses and instructs the actor to use a different email

#### Scenario: Conflict identifies the owner
- **WHEN** a provisioning request conflicts with an existing linked account
- **THEN** the error response identifies the owning account type (student, preceptor, or admin) so the admin can resolve it

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

