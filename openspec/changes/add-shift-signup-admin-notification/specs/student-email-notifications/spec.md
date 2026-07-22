## ADDED Requirements

### Requirement: Admin notification on shift request
When a student submits a shift request that results in a pending schedule row, the system SHALL attempt to notify all active admin accounts with `notify_schedule_requested = true` via email. The email SHALL include the student's name, shift date, shift type, and time range. Email delivery SHALL be best-effort and SHALL NOT affect the schedule creation outcome.

#### Scenario: Admin receives shift request notification
- **WHEN** a student submits a new shift request
- **THEN** all active admins with `notify_schedule_requested = true` receive an email with subject "New Shift Request — WFD EMS" containing the student's name, shift date, time range, and shift type

#### Scenario: Admin notification fails during shift request
- **WHEN** a student submits a shift request and the admin notification email fails
- **THEN** the schedule creation succeeds and the API returns `{ success: true }`
- **AND** the admin notification failure is logged
