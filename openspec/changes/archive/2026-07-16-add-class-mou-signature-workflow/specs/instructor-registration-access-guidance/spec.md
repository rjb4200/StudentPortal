## MODIFIED Requirements

### Requirement: Accurate admin approval messaging
The instructor registration workflow SHALL explain that portal admin approval is required before students can register, that the instructor will receive an email when the registered class is approved, and that a completed MOU with both party signatures will be emailed to the instructor after the WFEMS signer has signed.

#### Scenario: Submission confirmation explains approval requirement
- **WHEN** an instructor successfully submits a class registration including the signed MOU
- **THEN** the confirmation message explains that the class is pending admin review
- **AND** the confirmation message explains that students cannot register until the class is approved and the class start date has been reached
- **AND** the confirmation message explains that the instructor will receive an email when the class is approved
- **AND** the confirmation message explains that a completed MOU with both party signatures will be emailed after the WFEMS signer has signed

## ADDED Requirements

### Requirement: MOU step in instructor registration workflow
The instructor registration workflow SHALL include a mandatory fourth step after class details where the instructor reviews a pre-filled MOU, provides an electronic signature, and submits the complete registration.

#### Scenario: Instructor navigates to MOU step
- **WHEN** an instructor completes the class details step
- **THEN** the MOU review step is displayed showing a pre-filled agreement with TEI name, instructor details, class name, and class date window

#### Scenario: MOU step shows registration summary
- **WHEN** the MOU step is displayed
- **THEN** the TEI name, instructor name, class name, class start date, and ride-time end date from previous steps are shown in the MOU

#### Scenario: MOU step requires electronic signature
- **WHEN** an instructor reaches the MOU step
- **THEN** a signature prompt is shown requiring the instructor to type their name as acceptance

### Requirement: Instructor MOU signature fields
The MOU signature step SHALL display representative name and title fields pre-filled from the instructor registration form. The representative name field SHALL default to the instructor's full name. The representative title field SHALL default to the instructor's title.

#### Scenario: Signature fields pre-filled from instructor data
- **WHEN** the MOU step is displayed for a new instructor registration
- **THEN** the representative name field is pre-filled with the instructor's first and last name
- **AND** the representative title field is pre-filled with the instructor's title

#### Scenario: Instructor may edit signature fields
- **WHEN** the representative signing the MOU differs from the registered instructor
- **THEN** the instructor may edit the representative name and title fields before signing

### Requirement: MOU template body configured by admins
The MOU body text SHALL be stored as an admin-configurable template. The instructor registration SHALL display the current active MOU body text during the review step.

#### Scenario: Instructor sees current MOU body text
- **WHEN** an instructor reaches the MOU review step
- **THEN** the full MOU body text from the active portal setting is displayed
