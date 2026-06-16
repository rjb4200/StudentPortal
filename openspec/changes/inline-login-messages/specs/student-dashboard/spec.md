## MODIFIED Requirements

### Requirement: Dashboard access control
The system SHALL redirect students to `/login` with a `reason` query parameter indicating the specific access-denial cause if they are not certified, if their access has expired, or if they have been blacklisted or terminated by an admin.

#### Scenario: Uncertified student redirected
- **WHEN** a student who has not completed the knowledge gate navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=not-registered`

#### Scenario: Expired student redirected
- **WHEN** a student whose `access_until` timestamp has passed navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=expired`

#### Scenario: Blacklisted or terminated student redirected
- **WHEN** a student flagged as blacklisted or terminated navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=blacklisted`

#### Scenario: Archived student redirected
- **WHEN** a student with status `archived` navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=archived`
