## ADDED Requirements

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
The system SHALL allow admin users to edit student personal information (name, email, phone, school, instructor, contact), status, blacklist flag, and no-show count from the Account Management page.

#### Scenario: Edit student info
- **WHEN** an admin changes a student's name, email, or school information and saves
- **THEN** the student record is updated and changes reflect on the roster and dashboard

#### Scenario: Change student status
- **WHEN** an admin changes a student's status from pending to certified
- **THEN** the student's dashboard access is updated on next middleware check

#### Scenario: Student roster links to edit page
- **WHEN** an admin clicks a student name in the Daily Ops Student Roster
- **THEN** the browser navigates to `/admin/accounts?edit=<student-id>` with the student's edit form open

### Requirement: Notification recipient configuration
The system SHALL use per-account notification preferences from `admin_accounts` and `preceptors` to determine email recipients for system notifications, replacing hard-coded email addresses.

#### Scenario: Onboarding complete notification
- **WHEN** a student completes onboarding
- **THEN** emails are sent to all active admin accounts with `notify_onboarding_complete = true`

#### Scenario: Flagged evaluation notification
- **WHEN** an evaluation is submitted with overall rating less than 3
- **THEN** emails are sent to all active admin accounts with `notify_evaluation_flagged = true`

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
