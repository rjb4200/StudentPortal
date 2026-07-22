## MODIFIED Requirements

### Requirement: Full registry record editing
The system SHALL provide focused create and edit flows for training sites, instructors, and training classes. Each edit flow SHALL expose every existing editable field stored for that entity and SHALL preserve server-side validation of class date windows and instructor/site association. The training class edit flow SHALL include a dropdown for selecting the certification level from the constrained list of values: First Responder, EMT, AEMT, Paramedic, Critical Care, Community Paramedic, Wilderness Paramedic. The level field SHALL be optional.

#### Scenario: Administrator edits instructor contact details
- **WHEN** an administrator edits an instructor record
- **THEN** the form displays the instructor's existing contact, credential, title, preference, and site-association fields and saves validated changes through the admin registry API

#### Scenario: Administrator enters an invalid class window
- **WHEN** an administrator submits a class with a ride-time end date before its class start date
- **THEN** the system rejects the save and displays an actionable validation error without changing the stored class

#### Scenario: Administrator sets class level
- **WHEN** an administrator creates or edits a training class and selects a certification level from the dropdown
- **THEN** the selected level is saved to the class record and displayed in the class list

#### Scenario: Administrator leaves class level unset
- **WHEN** an administrator creates or edits a training class without selecting a certification level
- **THEN** the class record stores `level = null` and the class list displays without a level indicator

## ADDED Requirements

### Requirement: Class level visibility in registry table
The Classes view SHALL display each class's certification level alongside its name, site, instructor, date window, status, and enrolled-student count.

#### Scenario: Class with level in registry table
- **WHEN** an administrator views the Classes table and a class has a non-null level
- **THEN** the level is displayed as a visible label or badge in the class row

#### Scenario: Class without level in registry table
- **WHEN** an administrator views the Classes table and a class has `level = null`
- **THEN** the class row displays without a level indicator
