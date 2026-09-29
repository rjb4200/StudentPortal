## MODIFIED Requirements

### Requirement: Instructor MOU review and signature step
The instructor registration workflow SHALL include a fourth step where the instructor reviews a pre-filled MOU containing: effective date, training organization name, class name, class date window, and representative details derived from the registration form. The instructor SHALL either type their name as an electronic signature to submit, or skip the MOU by completing an acknowledgment. The signature path SHALL remain the primary action, and the skip affordance SHALL be de-emphasized and always available.

#### Scenario: Instructor reviews pre-filled MOU
- **WHEN** an instructor reaches step 4 of the registration workflow
- **THEN** the page displays the full MOU with all fields pre-populated from the TEI, instructor, and class details entered in earlier steps

#### Scenario: Instructor provides electronic signature
- **WHEN** an instructor types their name in the signature field and submits
- **THEN** the instructor's signature and signature timestamp are recorded on the class_mous record

#### Scenario: Instructor cannot submit without signature or skip acknowledgment
- **WHEN** an instructor attempts to submit the MOU step without providing a signature and without completing the skip acknowledgment
- **THEN** the submission is blocked and the missing signature or acknowledgment is highlighted

#### Scenario: Instructor skips the MOU with acknowledgment
- **WHEN** an instructor uses the skip affordance, selects a skip reason, confirms that they understand a MOU is required for students to ride, and submits
- **THEN** the registration is accepted without a class_mous signature record
- **AND** a class_mou_skips record is created capturing the selected reason and acknowledging representative

#### Scenario: Skip affordance is de-emphasized
- **WHEN** an instructor views step 4 of the registration workflow
- **THEN** the signature and submit actions are presented as the primary path
- **AND** the skip affordance is presented as a secondary, visually muted option

## ADDED Requirements

### Requirement: Class MOU skip record
The system SHALL maintain a `class_mou_skips` table that records training classes that submit without a portal MOU. The table SHALL contain at most one record per training class and SHALL capture: the training class reference, the skip reason, the acknowledging representative's name, the acknowledgment timestamp, and admin dismissal fields (`dismissed_at`, `dismissed_by`) defaulting to null. The skip reason SHALL be one of `existing_mou` ("We already have an executed MOU with WFEMS") or `will_execute_separately` ("We will execute an MOU with WFEMS separately").

#### Scenario: Skip record created with reason
- **WHEN** a class registration is submitted with a skipped MOU
- **THEN** a class_mou_skips record is created for that training class with the selected reason, acknowledging representative name, and acknowledgment timestamp

#### Scenario: One skip record per class
- **WHEN** a training class already has a class_mou_skips record
- **THEN** the system does not create a second skip record for that class

#### Scenario: Skip reasons are constrained
- **WHEN** a skip submission provides a reason other than `existing_mou` or `will_execute_separately`
- **THEN** the submission is rejected

### Requirement: MOU skip suppresses pending-signature notification
When an instructor submits a class registration with a skipped MOU, the system SHALL NOT send the "MOU awaiting WFEMS signature" notification to admins. The notification behavior for signed MOUs SHALL remain unchanged.

#### Scenario: No notification on skip
- **WHEN** an instructor submits a class registration with a skipped MOU
- **THEN** no "MOU awaiting WFEMS signature" email is sent to admins

#### Scenario: Notification still sent on signature
- **WHEN** an instructor submits a class registration with a signed MOU
- **THEN** active admin accounts with the MOU notification preference enabled receive the "MOU awaiting WFEMS signature" email

### Requirement: MOU skip does not affect student access
A skipped MOU SHALL NOT change any student-facing behavior. It SHALL NOT block class approval, student onboarding, student scheduling, or ride-time access.

#### Scenario: Skipped MOU class can still be approved
- **WHEN** a class with a skipped MOU is pending approval
- **THEN** an admin can approve or reject the class independently of the skip

#### Scenario: Students of a skipped MOU class are not blocked
- **WHEN** a class has a skipped MOU and is approved and within its date window
- **THEN** students of that class can onboard and schedule rides exactly as they would for a class with a signed MOU
