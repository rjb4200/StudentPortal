# instructor-registration-access-guidance

## Purpose

Define instructor-facing guidance and notification behavior for class registration date windows, portal admin approval, student ride-time access, and class approval emails.

## Requirements

### Requirement: Class date guidance
The instructor registration workflow SHALL explain that class dates control student registration, scheduling, ride-time eligibility, and portal access.

#### Scenario: Class step displays access guidance
- **WHEN** an instructor reaches the class registration step on `/instructor-registration`
- **THEN** the workflow displays guidance explaining that student access depends on the class start date, portal admin approval, and ride-time end date
- **AND** the guidance tells instructors to verify the dates before submitting because those dates affect student access

### Requirement: Class start date helper text
The instructor registration workflow SHALL explain near the class start date field that students cannot register before the class start date.

#### Scenario: Start date field explains registration timing
- **WHEN** an instructor views the beginning-of-class date field on the class registration step
- **THEN** the field includes nearby helper text explaining that students cannot register for the class before that date
- **AND** the helper text explains that portal admin approval is also required before students can register

### Requirement: Ride-time end date helper text
The instructor registration workflow SHALL explain near the ride-time end date field that student ride-time and portal access end after the ride-time period.

#### Scenario: Ride-time end field explains access expiration
- **WHEN** an instructor views the end-of-ride-time date field on the class registration step
- **THEN** the field includes nearby helper text explaining that students may only schedule or ride during the approved ride-time period
- **AND** the helper text explains that student portal access expires after the ride-time end date

### Requirement: Accurate admin approval messaging
The instructor registration workflow SHALL explain that portal admin approval is required before students can register and that the instructor will receive an email when the registered class is approved.

#### Scenario: Submission confirmation explains approval requirement
- **WHEN** an instructor successfully submits a class registration
- **THEN** the confirmation message explains that the class is pending admin review
- **AND** the confirmation message explains that students cannot register until the class is approved and the class start date has been reached
- **AND** the confirmation message explains that the instructor will receive an email when the class is approved

### Requirement: Instructor class approval email
The system SHALL email the associated instructor at the email address on their instructor record when a portal admin approves a registered class.

#### Scenario: Instructor receives approval email
- **WHEN** a portal admin changes a registered training class from a non-active status to `active`
- **THEN** the system sends an email to the associated instructor's email address
- **AND** the email explains that the class has been approved
- **AND** the email includes the class name, class start date, ride-time end date, and training site name when available
- **AND** the email uses the same WFD EMS branded email styling used by other portal emails

#### Scenario: Approval succeeds when email delivery fails
- **WHEN** a portal admin approves a registered training class and the approval email cannot be delivered
- **THEN** the class approval still succeeds
- **AND** the email failure is logged for troubleshooting

#### Scenario: Already active class is not re-notified
- **WHEN** a portal admin submits an approval action for a training class that is already `active`
- **THEN** the system does not send a duplicate instructor approval email
