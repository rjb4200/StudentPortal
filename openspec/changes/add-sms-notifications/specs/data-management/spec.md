## ADDED Requirements

### Requirement: SMS notification data model
The database SHALL store SMS notification queue/log records with enough information to process, audit, retry, and troubleshoot delivery attempts. The queue/log records SHALL be restricted so only authorized admin/service-role operations can read or mutate delivery data.

#### Scenario: SMS queue table exists
- **WHEN** the SMS migration has been applied
- **THEN** the database contains an SMS notification queue/log table with recipient, phone, notification type, channel, message body, send time, status, provider, provider message id, error message, attempt count, and timestamp fields

#### Scenario: Admin can inspect delivery failures
- **WHEN** an admin queries SMS notification records through the admin interface or an admin-only API
- **THEN** failed SMS records are visible with recipient context, status, error message, and attempt timestamps

#### Scenario: Non-admin cannot inspect SMS records
- **WHEN** a non-admin authenticated user or anonymous user attempts to read SMS notification records directly
- **THEN** the database denies access through RLS or the server API denies access before returning records

### Requirement: SMS contact and settings fields
The database SHALL store student SMS consent fields, admin SMS contact/preference fields, and global SMS settings needed to enable or disable SMS notification categories.

#### Scenario: Student SMS consent fields exist
- **WHEN** an admin views or updates a student record
- **THEN** the student record supports phone, SMS opt-in, and SMS verified fields without changing the student's primary key

#### Scenario: Admin SMS preference fields exist
- **WHEN** an admin views or updates an admin account
- **THEN** the admin account supports phone, SMS opt-in, SMS verified, and SMS alert preference fields

#### Scenario: Global SMS settings exist
- **WHEN** the SMS migration has been applied
- **THEN** the system has settings for enabling student shift approval SMS, student day-before reminder SMS, admin SMS alerts, and reminder send time
