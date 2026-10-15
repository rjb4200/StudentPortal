## MODIFIED Requirements

### Requirement: Preceptor account management
The system SHALL allow admin users to create, edit, disable, and delete preceptor accounts with profile info (name, station, bio, image, tags) and notification preferences. A preceptor account MAY be created with a password-based login by providing an email and password, or without a login by leaving both blank; a login-less preceptor SHALL be stored as a `preceptors` row with no linked auth user and no email. When a login is requested, creating the account SHALL be a single server-side operation that provisions or replaces the Supabase Auth login and inserts the `preceptors` row, and SHALL NOT leave an orphaned auth user when the profile insert fails. Providing an email without a password, or a password without an email, SHALL be rejected. Student and staff accounts SHALL remain separate: an email used by a student record SHALL NOT be used for a preceptor account.

#### Scenario: Create preceptor account with a login
- **WHEN** an admin creates a preceptor with name, email, password, and station
- **THEN** a preceptor login is created with role `preceptor`, linked to a `preceptors` row, and no orphaned auth user remains if either step fails

#### Scenario: Create a login-less preceptor
- **WHEN** an admin creates a preceptor with a name and no email or password
- **THEN** a `preceptors` row is created with no linked auth user and no email
- **AND** no Supabase Auth user is created

#### Scenario: Email without password is rejected
- **WHEN** an admin creates a preceptor with an email but no password
- **THEN** the operation is rejected with a message to provide both or leave both blank

#### Scenario: Password without email is rejected
- **WHEN** an admin creates a preceptor with a password but no email
- **THEN** the operation is rejected with a message to provide both or leave both blank

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
