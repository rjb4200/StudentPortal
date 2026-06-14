## ADDED Requirements

### Requirement: Magic links redirect to dashboard
Magic links sent after onboarding completion and admin approval SHALL redirect the student to the dashboard at `/dashboard`, not the home page.

#### Scenario: Onboarding complete magic link
- **WHEN** a student completes the onboarding quiz and clicks the magic link
- **THEN** the browser redirects to `/dashboard`

#### Scenario: Admin approval magic link
- **WHEN** an admin approves a pending student and the student clicks the magic link
- **THEN** the browser redirects to `/dashboard`

### Requirement: Blacklisted page
The system SHALL redirect blacklisted students to a dedicated `/blacklisted` page that informs them their account has been removed.

#### Scenario: Blacklisted student accesses dashboard
- **WHEN** a blacklisted student attempts to access `/dashboard`
- **THEN** middleware redirects to `/blacklisted` showing a brief message with no links

### Requirement: Expired page
The system SHALL redirect expired students to a dedicated `/expired` page that informs them their access has expired and provides a link to re-register.

#### Scenario: Expired student accesses dashboard
- **WHEN** an expired student attempts to access `/dashboard`
- **THEN** middleware redirects to `/expired` showing the expired message with a link to re-register via onboarding

#### Scenario: Expired student re-registers
- **WHEN** an expired student clicks the re-register link on the `/expired` page
- **THEN** they are taken to `/onboarding` where they can re-register
