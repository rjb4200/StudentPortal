## MODIFIED Requirements

### Requirement: Row Level Security on all tables
All tables SHALL have RLS enabled. Student policies SHALL restrict read/write to rows where an `auth.uid()` check matches `students.auth_user_id` for the relevant enrollment row. Admin policies SHALL grant full `ALL` access via a protected admin role check in Supabase Auth app metadata.

#### Scenario: RLS enforcement on students table
- **WHEN** a student queries the students table without admin role
- **THEN** only student rows whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: RLS enforcement on evaluations table
- **WHEN** a student queries the evaluations table without admin role
- **THEN** only evaluations where `student_id` references a student row whose `auth_user_id` matches their authenticated UUID are returned

#### Scenario: Admin bypass RLS
- **WHEN** a user with `app_metadata.role = 'admin'` queries an admin-managed table
- **THEN** all rows are returned regardless of student ownership

#### Scenario: User metadata does not bypass RLS
- **WHEN** a user has `user_metadata.role = 'admin'` but lacks `app_metadata.role = 'admin'`
- **THEN** admin RLS policies do not grant full table access
