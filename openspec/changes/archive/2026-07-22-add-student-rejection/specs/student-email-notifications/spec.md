# student-email-notifications Delta Spec

## ADDED Requirements

### Requirement: Student rejection email
When an admin rejects a student application, the system SHALL attempt to send the student a WFD-branded email notifying them their application was declined. The email SHALL include the rejection reason provided by the admin and SHALL use the standard WFD-branded HTML template. Email delivery is best-effort; the rejection operation SHALL succeed regardless of whether the email is delivered.

#### Scenario: Student receives rejection email
- **WHEN** an admin successfully rejects a pending student with reason "Missing eligibility documents"
- **THEN** the system attempts to send an email to the student at their registered address with subject "WFD EMS Student Portal — Application Declined"
- **AND** the email body includes the student's name, the rejection reason text, and information about reapplying

#### Scenario: Student already rejected does not receive duplicate email
- **WHEN** an admin attempts to reject a student who is already in `rejected` status
- **THEN** the system returns success without sending a duplicate email

#### Scenario: Email provider unavailable during student rejection
- **WHEN** an admin rejects a student and the email provider is unreachable
- **THEN** the student status is updated to `rejected` and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Instructor notification on student rejection
When an admin rejects a student associated with a training class, the system SHALL attempt to send the class instructor a WFD-branded email notifying them the student's application was declined. The email SHALL include the student's name, class name, and the rejection reason. Delivery is best-effort and SHALL NOT affect the rejection outcome.

#### Scenario: Instructor receives student rejection notification
- **WHEN** an admin rejects a pending student who is linked to a training class with an instructor that has an email address
- **THEN** the system attempts to send an email to the instructor with subject "Student Application Declined — WFD EMS Student Portal"
- **AND** the email body includes the student's name, class name, and rejection reason

#### Scenario: No instructor email available
- **WHEN** an admin rejects a pending student whose associated class has no instructor email
- **THEN** the rejection succeeds without attempting an instructor notification
- **AND** the student and admin notification emails are still attempted

#### Scenario: Instructor email delivery fails
- **WHEN** an admin rejects a student and the instructor notification email cannot be delivered
- **THEN** the rejection succeeds and the API returns `{ success: true }`
- **AND** the instructor email failure is logged

### Requirement: Admin notification on student rejection
When an admin rejects a student application, the system SHALL attempt to send the rejecting admin a WFD-branded confirmation email with the student's full contact information, class details, instructor information, rejection reason, and the identity of the rejecting admin. Delivery is best-effort and SHALL NOT affect the rejection outcome.

#### Scenario: Admin receives rejection confirmation
- **WHEN** an admin successfully rejects a pending student
- **THEN** the system attempts to send an email to the admin who performed the rejection with subject "Student Rejected — WFD EMS"
- **AND** the email body includes the student's full name, email, phone, school, class name, class window, site name, instructor name, instructor contact, rejection reason, and rejecting admin identity

#### Scenario: Admin notification email fails
- **WHEN** an admin rejects a student and the admin notification email cannot be delivered
- **THEN** the rejection succeeds and the API returns `{ success: true }`
- **AND** the admin notification failure is logged
