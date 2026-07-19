## MODIFIED Requirements

### Requirement: Row Level Security on all tables
All database tables SHALL have Row Level Security (RLS) enabled. Students SHALL only read and write their own enrollment-scoped records by resolving `auth.uid()` through `students.auth_user_id`; related tables SHALL reference the immutable `students.id` enrollment id via EXISTS subqueries. Admin users SHALL have full `ALL` access to admin-managed tables via protected `app_metadata.role = 'admin'` claims in `auth.jwt()`. RLS policies SHALL NOT use user-editable `user_metadata.role` for authorization.

The `students` table SHALL use `auth.uid() = auth_user_id` for student SELECT and UPDATE policies. The `schedules`, `evaluations`, `messages`, and `student_field_values` tables SHALL use EXISTS subqueries routing through `students.auth_user_id`. INSERT policies on `schedules` and `evaluations` SHALL additionally require `students.status = 'certified'` and `students.is_blacklisted = false`. Message INSERT policies SHALL require `students.status` to be `pending` or `certified` and `students.is_blacklisted = false`. Onboarding field value inserts SHALL require `students.status = 'pending'`.

#### Scenario: Student queries own students record
- **WHEN** a student queries the students table by `auth_user_id`
- **THEN** the row where `auth_user_id` matches `auth.uid()` is returned

#### Scenario: Student queries own schedules
- **WHEN** a student queries the schedules table
- **THEN** only rows where `student_id` references a student row whose `auth_user_id` matches the authenticated UUID are returned

#### Scenario: Student inserts own schedule
- **WHEN** a certified, non-blacklisted student inserts a schedule row
- **THEN** the insert succeeds because the associated student row passes the `status = 'certified'` and `is_blacklisted = false` checks

#### Scenario: Pending student cannot insert schedule
- **WHEN** a pending student attempts to insert a schedule row
- **THEN** the insert is blocked because the EXISTS check requires `status = 'certified'`

#### Scenario: Pending student inserts own message
- **WHEN** a pending, non-blacklisted student inserts a message row for their own enrollment
- **THEN** the insert succeeds because the message policy permits the pending status

#### Scenario: Blacklisted student cannot insert a message
- **WHEN** a blacklisted student attempts to insert a message row
- **THEN** the insert is blocked

#### Scenario: Student cannot view another student's records
- **WHEN** a student queries the schedules table filtering by another student's UUID
- **THEN** no rows are returned because the EXISTS check fails for a different student's `auth_user_id`

#### Scenario: Onboarding inserts field values for pending student
- **WHEN** a pending, non-blacklisted student inserts a student_field_values row
- **THEN** the insert succeeds because the EXISTS check requires `status = 'pending'` and `is_blacklisted = false`

#### Scenario: Admin queries all records
- **WHEN** an admin with `app_metadata.role = 'admin'` queries any admin-managed table
- **THEN** all rows are returned regardless of ownership or status

#### Scenario: User metadata admin claim is rejected by RLS
- **WHEN** a user has `user_metadata.role = 'admin'` but lacks `app_metadata.role = 'admin'`
- **THEN** admin RLS policies do not grant admin access
