## ADDED Requirements

### Requirement: Orphaned auth user monitoring
The system health dashboard SHALL report the count of orphaned Supabase Auth users — users that are linked to no `students`, `admin_accounts`, or `preceptors` row by `auth_user_id` or by email. The report SHALL distinguish users that have never signed in from users that have, without exposing credentials or secret values.

#### Scenario: Orphan count is displayed
- **WHEN** an admin opens the system health dashboard and one or more auth users have no matching profile
- **THEN** the dashboard displays the orphan count with context (total and never-signed-in)

#### Scenario: No orphans
- **WHEN** every auth user is linked to a profile record
- **THEN** the dashboard displays a healthy or neutral state with an orphan count of zero

#### Scenario: Orphan metrics do not expose secrets
- **WHEN** the system health API reports orphaned auth users
- **THEN** it returns only counts and non-sensitive identifiers and never returns passwords, tokens, or secret environment values

### Requirement: Auth user reconciliation sweep
The daily sweep SHALL detect auth users with no matching profile and record the result. When the sweep is configured to clean, it SHALL delete only orphaned auth users that have never signed in, and SHALL record the reconciliation outcome in durable job history.

#### Scenario: Sweep records orphan findings
- **WHEN** the daily sweep runs and finds auth users with no matching profile
- **THEN** the run summary records the number of orphaned users found and the system job history reflects the run

#### Scenario: Sweep cleans only safe orphans
- **WHEN** the sweep is configured to clean and an orphaned auth user has never signed in
- **THEN** that auth user is deleted and the deletion count is recorded, while linked users and users that have signed in are left untouched

#### Scenario: Linked users are never removed by the sweep
- **WHEN** the sweep evaluates an auth user that is referenced by a profile row
- **THEN** the user is not deleted regardless of sign-in history
