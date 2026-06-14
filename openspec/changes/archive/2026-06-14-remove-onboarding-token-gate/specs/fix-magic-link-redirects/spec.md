## MODIFIED Requirements

### Requirement: Expired page
The system SHALL redirect expired students to a dedicated `/expired` page that informs them their access has expired and provides a link to re-register.

#### Scenario: Expired student accesses dashboard
- **WHEN** an expired student attempts to access `/dashboard`
- **THEN** middleware redirects to `/expired` showing the expired message with a link to re-register via onboarding

#### Scenario: Expired student re-registers
- **WHEN** an expired student clicks the re-register link on the `/expired` page
- **THEN** they are taken to `/onboarding` where they can re-register
