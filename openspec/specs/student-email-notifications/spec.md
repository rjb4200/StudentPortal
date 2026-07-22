# student-email-notifications Specification

## Purpose
TBD - created by archiving change student-email-notifications. Update Purpose after archive.
## Requirements
### Requirement: Account approved email
When an admin approves a student, the system SHALL attempt to send the student a WFD-branded email notifying them their account is active. The email SHALL use the same HTML template as the onboarding credential email with the WFD logo, crimson `#A40104` header band, charcoal `#1C1C1E` bottom border, credential-style body box, and a "Go to Student Portal Login" CTA button linking to `/login`. The email SHALL include general instructions to report to Station 1 at 0700 for assignment by the on-duty Brigade Chief and SHALL include the active Station 1 map link when configured. Email delivery is best-effort; the approval operation SHALL succeed regardless of whether the email is delivered.

#### Scenario: Admin approves a student
- **WHEN** an admin successfully approves a pending student via the approve-student API
- **THEN** the system attempts to send an email to the student at their registered address with subject "WFD EMS Student Portal — Account Approved" and a body that includes the student's name, confirmation that their account is active, Station 1 reporting instructions, an active map link when configured, and a link to `/login`

#### Scenario: Student already approved
- **WHEN** an admin attempts to approve a student who is already certified
- **THEN** the system returns success without sending a duplicate email

#### Scenario: Email provider unavailable during approval
- **WHEN** an admin approves a student and the email provider is unreachable
- **THEN** the student status is updated to `certified` and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Instructor class approval email includes student registration link
When an admin approves a class, the system SHALL attempt to send the associated instructor a WFD-branded class approval email that includes a class-specific student registration link. The link SHALL use the canonical production site URL and the approved class id so the instructor can forward it to students for class-specific onboarding. Email delivery SHALL remain best-effort; class approval SHALL succeed regardless of email delivery outcome.

#### Scenario: Class approval email contains registration link
- **WHEN** an admin approves a pending class
- **THEN** the system attempts to send the associated instructor an email with subject "Class Approved — WFD EMS Student Portal"
- **AND** the email contains a student registration link in the form `https://studentportal.winchesterfireems.com/onboarding?class=<training_class_id>`
- **AND** the email explains that the instructor can share the link with students for that class

#### Scenario: Already active class does not send duplicate link email
- **WHEN** an admin approves a class that is already active
- **THEN** the system does not send a duplicate class approval email

#### Scenario: Class approval succeeds if link email fails
- **WHEN** an admin approves a class and the instructor approval email cannot be delivered
- **THEN** the class status update still succeeds
- **AND** the email delivery failure is logged

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

### Requirement: WFD-branded email template consistency
All student-facing emails SHALL use a consistent WFD-branded HTML template with crimson `#A40104` header background, charcoal `#1C1C1E` bottom border, WFD logo from branding storage, body text in `#4b5563`, footer text in `#6b7280`, and CTA buttons in crimson `#A40104` with no secondary border color. The `from` address SHALL be `onboarding@winchesterfireems.com` for account-related emails and `noreply@winchesterfireems.com` for schedule-related emails. Brand colors SHALL be centralized in shared constants imported from `src/lib/email.ts`.

#### Scenario: All student emails share the same visual template
- **WHEN** any student-facing transactional email is rendered
- **THEN** it uses the WFD logo header with crimson background, charcoal divider, branded body and footer, and matching CTA button styling
- **AND** all brand colors are sourced from canonical constants

#### Scenario: No rogue colors in email templates
- **WHEN** any email template renders a button
- **THEN** the button uses `#A40104` for background and shadow with no secondary border color

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

### Requirement: Admin notification on shift request
When a student submits a shift request that results in a pending schedule row, the system SHALL attempt to notify all active admin accounts with `notify_schedule_requested = true` via email. The email SHALL include the student's name, shift date, shift type, and time range. Email delivery SHALL be best-effort and SHALL NOT affect the schedule creation outcome.

#### Scenario: Admin receives shift request notification
- **WHEN** a student submits a new shift request
- **THEN** all active admins with `notify_schedule_requested = true` receive an email with subject "New Shift Request — WFD EMS" containing the student's name, shift date, time range, and shift type

#### Scenario: Admin notification fails during shift request
- **WHEN** a student submits a shift request and the admin notification email fails
- **THEN** the schedule creation succeeds and the API returns `{ success: true }`
- **AND** the admin notification failure is logged

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

### Requirement: Safe HTML formatting in all transactional emails

All student-provided data inserted into transactional email HTML SHALL be HTML-escaped so that special characters (`<`, `>`, `&`, `"`, `'`) in student names, email addresses, school names, and cancel notes cannot break the email markup or alter the rendered content. This requirement applies to every transactional email: account approval, onboarding completion, schedule approval/rejection/cancellation, student rejection, instructor and admin rejection notifications, evaluation receipt, flagged evaluation, and admin notifications.

#### Scenario: Approval email is safe with special characters in name
- **WHEN** an admin approves a student whose `full_name` is `O'Brien <test@evil.com>`
- **THEN** the approval email HTML contains `O&#39;Brien &lt;test@evil.com&gt;`
- **AND** the email renders correctly in an email client showing the literal name `O'Brien <test@evil.com>`

#### Scenario: Cancel note containing HTML-like text is escaped
- **WHEN** a student submits a shift cancellation note containing `<b>urgent</b>`
- **AND** the cancellation email is rendered
- **THEN** the email HTML contains `&lt;b&gt;urgent&lt;/b&gt;` as literal text
- **AND** the text is not interpreted as HTML bold tags

#### Scenario: All existing emails render identically with normal data
- **WHEN** student data contains no special characters (typical names, valid emails)
- **THEN** every transactional email renders identically to its pre-fix version
- **AND** no visual differences are detectable in any email client

