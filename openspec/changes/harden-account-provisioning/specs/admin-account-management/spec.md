## MODIFIED Requirements

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
