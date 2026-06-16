# auth-first-login Specification

## Purpose
TBD - created by archiving change auth-first-login-85. Update Purpose after archive.
## Requirements
### Requirement: Authentication before student status check
The student login flow SHALL attempt Supabase password authentication first. Only after successful authentication SHALL the system query the `students` table by `auth_user_id` to determine the student's status. The system SHALL NOT query the `students` table by email before authenticating.

#### Scenario: Successful login for certified student
- **WHEN** a certified student with a linked auth user enters correct credentials
- **THEN** the system authenticates via `signInWithPassword`, queries `students` by `auth_user_id`, finds the certified record, and redirects to `/dashboard`

#### Scenario: Successful login for test record student
- **WHEN** a certified student with `is_test_record = true` and a linked auth user enters correct credentials
- **THEN** the system authenticates via `signInWithPassword`, queries `students` by `auth_user_id`, finds the test record, and redirects to `/dashboard`

#### Scenario: Auth succeeds but no student record linked
- **WHEN** a user authenticates successfully but no `students` row matches their `auth_user_id`
- **THEN** the system displays an inline message: "Your login account exists but no student registration is linked. Please complete onboarding." with an action button linking to `/onboarding`

#### Scenario: Invalid credentials
- **WHEN** a user enters an email and password that do not match any Supabase Auth user
- **THEN** the system displays an inline error message: "Invalid email or password." with a secondary link: "Don't have an account? Start Onboarding" linking to `/onboarding`

### Requirement: Permanent onboarding link on login form
The student login form SHALL display a permanent "Don't have an account? Start Onboarding" link below the Sign In button, alongside the existing "Forgot password?" link. This link SHALL be visible at all times, not only after a login failure.

#### Scenario: New student discovers onboarding
- **WHEN** a new student visits the login page
- **THEN** the form displays a "Don't have an account? Start Onboarding" link that navigates to `/onboarding`

#### Scenario: Returning student sees login form normally
- **WHEN** a returning student visits the login page
- **THEN** the permanent onboarding link is present but unobtrusive below the Sign In button

