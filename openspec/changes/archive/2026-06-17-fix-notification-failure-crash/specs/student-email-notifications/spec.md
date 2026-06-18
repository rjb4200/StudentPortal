## MODIFIED Requirements

### Requirement: Account approved email
When an admin approves a student, the system SHALL attempt to send the student a WFD-branded email notifying them their account is active. The email SHALL use the same HTML template as the onboarding credential email with the WFD logo, crimson `#A40104` header band, charcoal `#1C1C1E` bottom border, credential-style body box, and a "Go to Student Portal Login" CTA button linking to `/login`. Email delivery is best-effort; the approval operation SHALL succeed regardless of whether the email is delivered.

#### Scenario: Admin approves a student
- **WHEN** an admin successfully approves a pending student via the approve-student API
- **THEN** the system attempts to send an email to the student at their registered address with subject "WFD EMS Student Portal — Account Approved" and a body that includes the student's name, confirmation that their account is active, and a link to `/login`

#### Scenario: Student already approved
- **WHEN** an admin attempts to approve a student who is already certified
- **THEN** the system returns success without sending a duplicate email

#### Scenario: Email provider unavailable during approval
- **WHEN** an admin approves a student and the email provider is unreachable
- **THEN** the student status is updated to `certified` and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Schedule approved email
When an admin approves a scheduled shift day, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, and a link to their dashboard. The schedule update and email delivery SHALL happen in a single server-side API route. The schedule update SHALL succeed even if email delivery fails.

#### Scenario: Admin approves a schedule request
- **WHEN** an admin clicks "Approve" on a pending schedule request in the daily ops panel
- **THEN** the system updates the schedule status to 'approved' and attempts to send the student an email with subject "Shift Approved — WFD EMS Student Portal" containing the date, shift type, and a link to `/dashboard`

### Requirement: Schedule rejected email
When an admin rejects a scheduled shift day, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, and instructions to contact their preceptor or the Training Major. The rejection SHALL succeed even if email delivery fails.

#### Scenario: Admin rejects a schedule request
- **WHEN** an admin clicks "Reject" on a pending schedule request in the daily ops panel
- **THEN** the system updates the schedule status to 'rejected' and attempts to send the student an email with subject "Shift Request Update — WFD EMS Student Portal" containing the date, shift type, and instructions to contact staff for more information

### Requirement: Shift cancellation email
When a shift is cancelled (by student or admin), the system SHALL attempt to send a WFD-branded email to the student. Admin-initiated cancellations SHALL include the optional note text when present. Student-initiated cancellations SHALL include a "Student-initiated" label. The email SHALL use the standard WFD template with crimson header, logo, and credential-box body. The cancellation SHALL succeed even if email delivery fails.

#### Scenario: Admin cancels with note email
- **WHEN** an admin cancels a shift with the note "Class cancelled due to weather"
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" containing the date, time range, and the note text

#### Scenario: Student self-cancels confirmation email
- **WHEN** a student cancels their own shift
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" confirming their cancellation with the date and time range

#### Scenario: Email provider unavailable during cancellation
- **WHEN** a student cancels their own shift and the email provider is unreachable
- **THEN** the schedule status is updated and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Admin notification on student cancellation
When a student cancels their own shift, the system SHALL attempt to notify all active admins via email. The email SHALL include the student's name, shift date, time range, and a "Student-initiated" label. Delivery is best-effort and SHALL NOT affect the cancellation outcome.

#### Scenario: Admin receives student cancellation notification
- **WHEN** a student cancels their own shift
- **THEN** all active admins receive an email with subject "Student Shift Cancellation — WFD EMS" containing the student's name, shift date, time, and the word "Student-initiated"

#### Scenario: Admin notification fails during student cancellation
- **WHEN** a student cancels their own shift and the admin notification email fails
- **THEN** the cancellation succeeds and the student confirmation email is still attempted independently
- **AND** the admin notification failure is logged
