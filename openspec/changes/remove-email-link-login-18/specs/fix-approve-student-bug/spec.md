## MODIFIED Requirements

### Requirement: Server-side student approval
The system SHALL provide a server-side API route for approving pending students that creates a Supabase Auth user if one does not exist, updates the student record to certified status with a 120-day access expiry, and performs the approval without sending an email.

#### Scenario: Approve pending student
- **WHEN** an admin clicks Approve on a pending student
- **THEN** the approval is processed server-side, the student becomes certified with access_until set to 120 days from now

#### Scenario: Student already has auth user
- **WHEN** a pending student already has a Supabase Auth user (created during onboarding completion)
- **THEN** auth user creation is skipped and only the status update is performed
