# admin-shift-signup-notification Specification

## Purpose

Email notification to subscribed admin accounts when a student submits a new shift request, so signups are not missed.

## Requirements

### Requirement: Admin notification on shift request
When a student successfully submits a shift request via the schedule API, the system SHALL attempt to notify all active admin accounts with `notify_schedule_requested = true` via email. The email SHALL include the student's name, shift date, shift type, and time range. Email delivery SHALL be best-effort; the schedule insert SHALL succeed regardless of whether the admin notification email is delivered.

#### Scenario: Student submits shift request
- **WHEN** a student submits a valid shift request (date, shift type, start time, end time) via `POST /api/schedule/request`
- **THEN** the system inserts a pending schedule row
- **AND** the system queries all active admin accounts with `notify_schedule_requested = true`
- **AND** the system attempts to send each subscribed admin an email with subject "New Shift Request — WFD EMS" containing the student's name, date, shift type, and time range
- **AND** the API returns `{ success: true, schedule }` regardless of email delivery outcome

#### Scenario: No admins subscribed
- **WHEN** a student submits a shift request but no active admin has `notify_schedule_requested = true`
- **THEN** the schedule is inserted successfully
- **AND** no admin email is sent
- **AND** the API returns `{ success: true, schedule }`

#### Scenario: Email delivery fails
- **WHEN** a student submits a shift request and the admin notification email fails to deliver
- **THEN** the schedule is still inserted successfully
- **AND** the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Admin notification email template
The admin shift request notification email SHALL use the standard WFD-branded HTML template with crimson header, logo, credential-box body, and charcoal bottom border. The email SHALL be sent from `noreply@winchesterfireems.com`. All student-provided data in the email SHALL be HTML-escaped.

#### Scenario: Standard shift request email
- **WHEN** a student named "Jane Doe" requests a full shift on July 24, 2026 from 7:00 AM to 10:00 PM
- **THEN** the admin email contains "Jane Doe has submitted a new shift request" in the body
- **AND** the email contains the date, shift type "full", and time range "7:00 AM – 10:00 PM" in a credential-style info box
- **AND** the email uses the standard WFD template with crimson header and logo

### Requirement: Notification preference toggle
The `admin_accounts` table SHALL include a `notify_schedule_requested` column of type `boolean` with a default value of `true`. The admin Account Management page SHALL expose this toggle alongside the other notification preferences.

#### Scenario: Admin enables schedule request notifications
- **WHEN** an admin sets `notify_schedule_requested` to `true` and saves
- **THEN** future student shift requests trigger an email to that admin

#### Scenario: Admin disables schedule request notifications
- **WHEN** an admin sets `notify_schedule_requested` to `false` and saves
- **THEN** future student shift requests do not trigger an email to that admin
