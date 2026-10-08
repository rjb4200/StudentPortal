## MODIFIED Requirements

### Requirement: Admin account management
The system SHALL allow admin users to create, edit, disable, and delete admin accounts from the Account Management page, including password-based authentication and per-account notification preferences. Creating an admin account SHALL be a single server-side operation that provisions or reuses the Supabase Auth user and inserts the `admin_accounts` row, and SHALL NOT leave an orphaned auth user when the profile insert fails.

#### Scenario: Create admin account
- **WHEN** an admin fills in full name, email, rank, and password and clicks save
- **THEN** a Supabase Auth user is created with role `admin`, an `admin_accounts` row is inserted and linked via `auth_user_id`, and no orphaned auth user remains if either step fails

#### Scenario: Create admin account for an unlinked existing email
- **WHEN** an admin creates an admin account whose email already has an auth user that is not linked to any student, admin, or preceptor record
- **THEN** the existing auth user is reused and linked to the new `admin_accounts` row instead of failing with an already-registered error

#### Scenario: Create admin account for an email owned by another account
- **WHEN** an admin creates an admin account whose email is already linked to a student, preceptor, or other admin record
- **THEN** the operation is rejected with a conflict that names the owning account type, and no auth user or profile row is created or modified

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
The system SHALL allow admin users to create, edit, disable, and delete preceptor accounts with password-based auth, profile info (name, station, bio, image, tags), and notification preferences. Creating a preceptor account SHALL be a single server-side operation that provisions or reuses the Supabase Auth user and inserts the `preceptors` row, and SHALL NOT leave an orphaned auth user when the profile insert fails.

#### Scenario: Create preceptor account
- **WHEN** an admin creates a preceptor with name, email, password, and station
- **THEN** a Supabase Auth user with role `preceptor` is created or reused, linked to a `preceptors` row, and no orphaned auth user remains if either step fails

#### Scenario: Create preceptor account for an unlinked existing email
- **WHEN** an admin creates a preceptor account whose email already has an auth user that is not linked to any student, admin, or preceptor record
- **THEN** the existing auth user is reused and linked to the new `preceptors` row instead of failing with an already-registered error

#### Scenario: Create preceptor account for an email owned by another account
- **WHEN** an admin creates a preceptor account whose email is already linked to a student, admin, or other preceptor record
- **THEN** the operation is rejected with a conflict that names the owning account type, and no auth user or profile row is created or modified

#### Scenario: Preceptor login
- **WHEN** a preceptor enters email and password on the login page Admin tab
- **THEN** they are redirected to `/preceptor`

#### Scenario: Preceptor sees coming-soon dashboard
- **WHEN** a preceptor logs in
- **THEN** they see a coming-soon page at `/preceptor`

## ADDED Requirements

### Requirement: Self-healing account provisioning
The system SHALL provision admin and preceptor accounts atomically from the user's perspective by performing auth-user creation and profile-row insertion in a single server-side operation. The profile row SHALL be created before the auth user, and if auth-user creation or linking fails the operation SHALL report failure without reserving the email. If an auth user was created by the operation and the profile row cannot be linked, the system SHALL delete only the auth user it created in that operation.

#### Scenario: Profile insert precedes auth user creation
- **WHEN** an admin submits a new admin or preceptor account
- **THEN** the system inserts the profile row first so that a duplicate email is detected before any auth user is created

#### Scenario: Failure during provisioning leaves no orphan
- **WHEN** profile-row creation succeeds but the subsequent auth-user creation or link fails
- **THEN** the operation reports the error and the email is not left reserved by an orphaned auth user

#### Scenario: Compensation removes only the operation's own auth user
- **WHEN** the operation created an auth user in this request and then must roll back
- **THEN** only that newly created auth user is deleted, and any pre-existing auth user is left untouched

### Requirement: Email ownership and role safety during provisioning
The system SHALL determine email ownership before creating or reusing an auth user, and SHALL NOT change the role of an auth user that already belongs to another account or role. Reusing an existing auth user SHALL be permitted only when it is unlinked and its existing role matches the account type being created; otherwise the system SHALL return a conflict and require an explicit admin decision.

#### Scenario: Unlinked matching-role user is reused
- **WHEN** the existing auth user for the email is unlinked and already has the role matching the requested account type
- **THEN** the user is reused and linked to the new profile row

#### Scenario: Existing role is not silently overwritten
- **WHEN** the existing auth user has a different role than the account type being created
- **THEN** the system does not modify the existing role and returns a conflict requiring the admin to choose a different email or an explicit role change

#### Scenario: Conflict identifies the owner
- **WHEN** a provisioning request conflicts with an existing linked account
- **THEN** the error response identifies the owning account type (student, preceptor, or admin) so the admin can resolve it
