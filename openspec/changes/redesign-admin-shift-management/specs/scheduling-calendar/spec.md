## MODIFIED Requirements

### Requirement: Admin approval workflow
The admin daily-ops "Action Required" panel SHALL display pending schedule requests with Approve and Reject buttons. Approved schedules SHALL NOT appear in the Action Required panel. Instead, approved schedules SHALL be managed in the Shift Management section where the admin can view, filter, and cancel them. Student-initiated cancellations of approved shifts SHALL appear in the Action Required feed as Cancel Requests with a "Cancel Shift" action button.

#### Scenario: Pending shift shows approve and reject options
- **WHEN** an admin views the Action Required panel
- **THEN** pending schedules are displayed with "Approve" and "Reject" buttons

#### Scenario: Approved shift shown in shift management only
- **WHEN** an admin views the Action Required panel
- **THEN** approved shifts are not displayed; they appear only in the Shift Management section under the Approved tab

#### Scenario: Cancelling an approved shift from shift management
- **WHEN** an admin clicks "Cancel" on an approved shift in the Shift Management table and confirms
- **THEN** the shift status changes to `cancelled`, `cancelled_by` is set to `admin`, and the student receives a cancellation email

#### Scenario: Student-initiated cancellation in action required
- **WHEN** a student cancels an approved shift
- **THEN** a Cancel Request entry appears in the Action Required feed with an amber badge and a "Cancel Shift" button
