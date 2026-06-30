## MODIFIED Requirements

### Requirement: Server-side student deletion with error reporting

The system SHALL provide a server-side API route (`POST /api/admin/delete-student`) for permanent student deletion. The route SHALL use the service-role admin client and require admin authentication. The route SHALL require a non-empty admin reason for abandoned-registration cleanup deletion requests. The route SHALL delete the student's Supabase Auth user (if linked via `auth_user_id`) before deleting the student record. If auth deletion fails, the route SHALL abort and return an error without deleting the student record. If student record deletion fails after successful auth deletion, the route SHALL attempt to recreate the auth user and return an error. The route SHALL record successful abandoned-registration cleanup deletions in the audit log with performer, reason, and student identity context. The route SHALL return `{ success: true }` on complete success or `{ error: string }` on any failure.

#### Scenario: Successful student deletion

- **WHEN** an admin sends a POST to `/api/admin/delete-student` with `{ studentId }` for a student with a linked auth user
- **THEN** the auth user is deleted from Supabase Auth
- **AND** the student record and all cascaded data (messages, schedules, evaluations, notes) are deleted
- **AND** the API returns `{ success: true }`

#### Scenario: Successful abandoned-registration deletion with reason

- **WHEN** an admin sends a POST to `/api/admin/delete-student` for an abandoned registration with a non-empty admin reason
- **THEN** the auth deletion step is skipped when no auth user is linked
- **AND** the student record and all cascaded data are deleted
- **AND** an audit log entry records the deletion reason and student identity context
- **AND** the API returns `{ success: true }`

#### Scenario: Abandoned-registration deletion blocked without reason

- **WHEN** an admin sends a POST to `/api/admin/delete-student` for an abandoned-registration cleanup deletion without a required reason
- **THEN** the API returns a validation error
- **AND** no auth user or student data is deleted

#### Scenario: Auth deletion fails, student record preserved

- **WHEN** an admin sends a POST to `/api/admin/delete-student` and the auth user deletion fails
- **THEN** the student record is NOT deleted
- **AND** the API returns `{ error: "..." }` describing the auth deletion failure

#### Scenario: Student without linked auth user

- **WHEN** an admin sends a POST to `/api/admin/delete-student` for a student with a null `auth_user_id`
- **THEN** the auth deletion step is skipped
- **AND** the student record is deleted normally

#### Scenario: Unauthorized access

- **WHEN** a non-admin user sends a POST to `/api/admin/delete-student`
- **THEN** the API returns HTTP 403 with `{ error: "Forbidden" }`

### Requirement: Visible error feedback on deletion failures

Admin-facing deletion UIs SHALL display error messages when a deletion operation fails. Empty `catch {}` blocks SHALL NOT be used on any deletion path. Error messages SHALL be displayed in a visible alert banner within the admin interface. High-risk deletion UIs SHALL also display pending and successful completion states so the admin can distinguish an in-progress action from a completed action.

#### Scenario: Deletion failure shows error to admin

- **WHEN** an admin attempts to delete a student and the operation fails
- **THEN** a visible error message is displayed in the admin panel
- **AND** the admin can see what went wrong without checking the browser console

#### Scenario: Successful deletion shows confirmation

- **WHEN** an admin successfully deletes a student
- **THEN** the student list reloads without the deleted student
- **AND** no error message is displayed

#### Scenario: Deletion pending state is visible

- **WHEN** an admin submits an abandoned-registration deletion
- **THEN** the interface displays a pending state until the API succeeds or fails
