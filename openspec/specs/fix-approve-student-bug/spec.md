## ADDED Requirements

### Requirement: Server-side student approval
The system SHALL provide a server-side API route for approving pending students that creates a Supabase Auth user if one does not exist, updates the student record to certified status with a 120-day access expiry, and sends a magic link email.

#### Scenario: Approve pending student
- **WHEN** an admin clicks Approve on a pending student
- **THEN** the approval is processed server-side, the student becomes certified with access_until set to 120 days from now, and a magic link is sent

#### Scenario: Student already has auth user
- **WHEN** a pending student already has a Supabase Auth user (created during onboarding completion)
- **THEN** auth user creation is skipped and only the status update and magic link are performed

### Requirement: Student Approval Queue uses API route
The Student Approval Queue SHALL use the server-side API route for approvals instead of calling `createAdminClient()` in the browser.

#### Scenario: Admin approves student from queue
- **WHEN** an admin clicks the Approve button on a pending student in Daily Ops
- **THEN** the student is approved via the API route and the queue refreshes
