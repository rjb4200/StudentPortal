## MODIFIED Requirements

### Requirement: Admin approval workflow
The admin daily-ops "Action Required" panel SHALL display pending schedule requests with Approve and Reject buttons. When approving a request, the admin MAY optionally assign one of that date's available preceptors to the student; the selection is optional and leaving it blank approves the shift with no preceptor. Approved schedules SHALL NOT appear in the Action Required panel. Instead, approved schedules SHALL be managed in the Shift Management section where the admin can view, filter, and cancel them. Student-initiated cancellations of approved shifts SHALL appear in the Action Required feed as Cancel Requests with a "Cancel Shift" action button.

#### Scenario: Pending shift shows approve and reject options
- **WHEN** an admin views the Action Required panel
- **THEN** pending schedules are displayed with "Approve" and "Reject" buttons

#### Scenario: Approve with an optional preceptor
- **WHEN** an admin approves a pending shift and selects an available preceptor for that date
- **THEN** the shift is approved and paired with the selected preceptor

#### Scenario: Approve without a preceptor
- **WHEN** an admin approves a pending shift and leaves the preceptor blank
- **THEN** the shift is approved with no preceptor assigned

#### Scenario: Preceptor options limited to the day's available pool
- **WHEN** an admin opens the preceptor selection for a pending shift
- **THEN** the available options are limited to that date's preceptor pool, excluding preceptors already paired on that date

#### Scenario: Capacity warning when students exceed preceptors
- **WHEN** approving a shift would make the approved students on a date exceed that date's preceptor count
- **THEN** the admin is warned that there are more students than available preceptors
- **AND** the admin may still proceed

#### Scenario: Approved shift shown in shift management only
- **WHEN** an admin views the Action Required panel
- **THEN** approved shifts are not displayed; they appear only in the Shift Management section under the Approved tab

#### Scenario: Cancelling an approved shift from shift management
- **WHEN** an admin clicks "Cancel" on an approved shift in the Shift Management table and confirms
- **THEN** the shift status changes to `cancelled`, `cancelled_by` is set to `admin`, and the student receives a cancellation email

#### Scenario: Student-initiated cancellation in action required
- **WHEN** a student cancels an approved shift
- **THEN** a Cancel Request entry appears in the Action Required feed with an amber badge and a "Cancel Shift" button
