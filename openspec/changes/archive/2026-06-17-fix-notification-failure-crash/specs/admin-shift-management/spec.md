## MODIFIED Requirements

### Requirement: Admin cancel from shift management
The Shift Management table SHALL provide a Cancel button on each approved schedule row, allowing the admin to cancel the shift with an optional note. The cancellation SHALL succeed even if the notification email cannot be delivered.

#### Scenario: Admin cancels approved shift from table
- **WHEN** an admin clicks the Cancel button on an approved schedule row, optionally enters a note, and confirms
- **THEN** the schedule status changes to `cancelled`, `cancelled_by` is set to `admin`, the row moves from the Approved tab to the Cancelled tab, and the system attempts to send a cancellation email to the student

#### Scenario: Cancel button not shown on non-approved rows
- **WHEN** the Shift Management table displays cancelled or rejected schedules
- **THEN** no Cancel button is rendered on those rows

#### Scenario: Email failure during admin cancellation
- **WHEN** an admin cancels a shift and the email provider is unreachable
- **THEN** the schedule status is still updated and the API returns `{ success: true }`
- **AND** the email failure is logged
