## MODIFIED Requirements

### Requirement: Server-side student approval
The system SHALL provide a server-side API route for approving pending students that updates the student record to certified status with a 120-day access expiry and returns structured JSON success or failure responses. The route SHALL return a non-OK response with a useful error message when authorization, validation, lookup, or certification update fails.

#### Scenario: Approve pending student
- **WHEN** an admin clicks Approve on a pending student
- **THEN** the approval is processed server-side, the student becomes certified with access_until set to 120 days from now, and the API returns `{ success: true }`

#### Scenario: Student already has auth user
- **WHEN** a pending student already has a Supabase Auth user created during onboarding completion
- **THEN** auth user creation is skipped and only the status update is performed

#### Scenario: Certification update fails
- **WHEN** the approval API cannot update the student record to certified status
- **THEN** the API returns a non-OK JSON response containing an `error` message and does not report `success: true`

### Requirement: Student Approval Queue uses API route
The Student Approval Queue SHALL use the server-side API route for approvals instead of calling `createAdminClient()` in the browser. The queue SHALL treat approval as successful only when the API response is OK and the response body confirms `success: true`.

#### Scenario: Admin approves student from queue
- **WHEN** an admin clicks the Approve button on a pending student in Daily Ops and the approval API confirms success
- **THEN** the student is approved via the API route and the queue refreshes

#### Scenario: Approval API returns failure
- **WHEN** an admin clicks the Approve button and the approval API returns a non-OK response or a response body without `success: true`
- **THEN** the queue displays an approval error to the admin and does not remove the pending approval as a successful action
