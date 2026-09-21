## ADDED Requirements

### Requirement: Admin notification when instructor signs MOU
The system SHALL send an email notification to all active admin accounts that have opted in to MOU notifications when an instructor completes the MOU signature step during class registration. The email SHALL include the training site name, class name, instructor name, and a statement that WFEMS signature is still required.

#### Scenario: Admins receive notification on instructor MOU submission
- **WHEN** an instructor submits a class registration that includes a signed MOU
- **AND** the class_mous record is successfully created
- **THEN** all active admin accounts with `notify_class_mou = true` receive a branded email with the training site, class, instructor name, and a notice that WFEMS signature is pending

#### Scenario: Admins with notifications disabled are not notified
- **WHEN** an instructor submits a class registration with a signed MOU
- **AND** an active admin account has `notify_class_mou = false`
- **THEN** that admin does not receive the pending-signature notification

#### Scenario: MOU insert failure prevents notification
- **WHEN** an instructor submits a class registration
- **AND** the class_mous insert fails with an error
- **THEN** no email is sent

#### Scenario: Email delivery failure does not block registration
- **WHEN** an instructor submits a class registration with a valid signed MOU
- **AND** the notification email fails to deliver to some or all recipients
- **THEN** the registration still completes successfully and the class_mous record is preserved
