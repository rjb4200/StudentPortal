# onboarding-auto-login Specification

## Purpose
TBD - created by archiving change onboarding-auto-login. Update Purpose after archive.
## Requirements
### Requirement: Continue to Dashboard button for new accounts
The system SHALL present a "Continue to Dashboard" button on the onboarding completion page for students whose onboarding created a new auth account. The button SHALL sign the student in client-side using the temporary password and redirect to the dashboard.

#### Scenario: New student clicks Continue to Dashboard
- **WHEN** a new-account student clicks "Continue to Dashboard" on the onboarding completion page
- **THEN** the system calls `supabase.auth.signInWithPassword` with the student's email and temporary password
- **AND** on success, redirects the browser to `/dashboard`
- **AND** the temporary password is removed from sessionStorage

#### Scenario: Auto-login fails gracefully
- **WHEN** the auto-login `signInWithPassword` call fails (network error, expired password, or account not yet approved)
- **THEN** the system redirects the browser to `/login`
- **AND** no error message is displayed on the completion page

#### Scenario: Password not stored in URL
- **WHEN** the "Continue to Dashboard" button is clicked
- **THEN** the temporary password is never placed in a URL query parameter or path segment
- **AND** the password is only transmitted in the POST body of the `signInWithPassword` call

### Requirement: Completion page differentiates new vs existing accounts
The system SHALL render different completion page content depending on whether the student account was newly created or linked to an existing auth account.

#### Scenario: New account completion page
- **WHEN** a student with a newly created auth account reaches the completion page
- **THEN** the page displays the student's email and temporary password in a credentials box
- **AND** a prominent "Continue to Dashboard" button is shown
- **AND** a secondary "Go to Login" link is available

#### Scenario: Existing account completion page
- **WHEN** a student with a linked existing auth account reaches the completion page
- **THEN** the page displays instructions to use their existing WFD credentials
- **AND** no temporary password or credentials box is shown
- **AND** no "Continue to Dashboard" auto-login button is shown
- **AND** a "Go to Login" button linking to `/login` is shown

### Requirement: API identifies new vs existing accounts
The `POST /api/notify/onboarding-complete` endpoint SHALL include an `isNewAccount` boolean in the response indicating whether a new auth user was created.

#### Scenario: New account response
- **WHEN** the onboarding completion API creates a new Supabase Auth user for the student
- **THEN** the response includes `isNewAccount: true`

#### Scenario: Existing account response
- **WHEN** the onboarding completion API links an existing Supabase Auth user to the student
- **THEN** the response includes `isNewAccount: false`

