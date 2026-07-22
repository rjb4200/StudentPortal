# student-rejection Specification

## Purpose
Defines the server-side API, UI confirmation, and audit trail for formally declining a pending student application.

## Requirements

### Requirement: Server-side student rejection API
The system SHALL provide a `POST /api/admin/reject-student` API route that authenticates the caller as an admin, validates the student is pending with completed onboarding, deletes the associated Supabase Auth user, sets the student status to `rejected`, stores the rejection reason with timestamp and admin identity, and returns structured JSON success or failure responses.

#### Scenario: Admin rejects a pending student
- **WHEN** an admin submits a valid rejection request with a non-empty reason for a pending student who has completed onboarding
- **THEN** the student's auth user is deleted, the student record is updated to `status = 'rejected'` with `rejection_reason`, `rejected_at`, and `rejected_by` set
- **AND** the API returns `{ success: true }`

#### Scenario: Rejection requires a reason
- **WHEN** an admin submits a rejection request with an empty or missing reason
- **THEN** the API returns a non-OK JSON response with an `error` message and does not modify the student record

#### Scenario: Rejection blocked for non-admin
- **WHEN** a non-admin user attempts to call the reject-student API
- **THEN** the API returns a 403 Forbidden response

#### Scenario: Rejection blocked for non-pending student
- **WHEN** an admin attempts to reject a student whose status is not `pending`
- **THEN** the API returns a non-OK JSON response with a descriptive error message

#### Scenario: Rejection blocked for incomplete onboarding
- **WHEN** an admin attempts to reject a student whose `onboarding_completed_at` is null
- **THEN** the API returns a non-OK JSON response with a descriptive error message

#### Scenario: Rejection rolls back on auth user deletion failure
- **WHEN** the Supabase Auth user deletion fails
- **THEN** the student record is NOT updated to `rejected` and the API returns a non-OK JSON response

#### Scenario: Rejection succeeds even if email delivery fails
- **WHEN** an admin rejects a student and one or more notification email(s) cannot be delivered
- **THEN** the student status is updated to `rejected` and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Rejection confirmation with required reason
The admin UI SHALL require explicit confirmation before rejecting a student. The confirmation dialog SHALL include a required text input for the rejection reason and SHALL prevent submission while the reason is empty.

#### Scenario: Admin clicks Reject and confirms with reason
- **WHEN** an admin clicks the Reject button for a pending student
- **THEN** a confirmation dialog opens with a required reason text input
- **AND** the confirm button is disabled while the reason is empty
- **AND** clicking the confirm button with a non-empty reason triggers the rejection

#### Scenario: Admin dismisses rejection dialog
- **WHEN** the rejection confirmation dialog is open
- **AND** the admin clicks Cancel or presses Escape
- **THEN** the dialog closes and no rejection occurs

### Requirement: Rejected students are blocked from dashboard access
The system SHALL prevent students with `status = 'rejected'` from accessing the dashboard or any authenticated student routes.

#### Scenario: Rejected student attempts to log in
- **WHEN** a student whose status is `rejected` attempts to access `/dashboard`
- **THEN** the middleware redirects them to the login page

### Requirement: Rejected students can reapply
The system SHALL allow a previously rejected student to register a new application using the same email address.

#### Scenario: Rejected student re-registers
- **WHEN** a student with a prior `rejected` record completes a new onboarding registration with the same email
- **THEN** a new `students` row is created with `status = 'pending'`
- **AND** the prior rejected record is unaffected

### Requirement: Rejection audit metadata
The system SHALL store the rejection reason, timestamp, and rejecting admin's email on the student record for audit purposes.

#### Scenario: Rejection metadata is persisted
- **WHEN** a student is successfully rejected
- **THEN** the student record contains a non-null `rejection_reason`, `rejected_at` timestamp, and `rejected_by` admin email
