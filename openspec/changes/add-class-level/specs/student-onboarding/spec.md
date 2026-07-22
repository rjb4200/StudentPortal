## ADDED Requirements

### Requirement: Class level displayed in registration class dropdown
The registration form's training class dropdown SHALL append the certification level to each class option label when the class has a non-null level. The format SHALL be `"Site Name - Class Name [Level]"`. Classes without a level SHALL display without a suffix, matching current behavior.

#### Scenario: Level shown in registration class dropdown
- **WHEN** a student views the registration form and available classes include one with `level = 'AEMT'`
- **THEN** the dropdown option for that class displays the level as a bracketed suffix, e.g., `"Station 2 - Spring AEMT [AEMT]"`

#### Scenario: Unleveled class in registration dropdown
- **WHEN** a student views the registration form and a class has `level = null`
- **THEN** the dropdown option displays without a bracketed suffix, matching the pre-level format

#### Scenario: Level shown on preselected class link
- **WHEN** a student opens `/onboarding?class=<id>` for a class with `level = 'Paramedic'`
- **THEN** the preselected class option and the informational banner both display the level
