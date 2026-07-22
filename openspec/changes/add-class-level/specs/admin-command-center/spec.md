## ADDED Requirements

### Requirement: Class level visibility in student roster and approvals
The Daily Operations student roster, pending-approval list, and student detail profile page SHALL display the certification level from the student's associated training class when the class has a non-null level. The level SHALL be retrieved through the existing `training_classes` foreign-key join and SHALL be displayed alongside or as part of the class label.

#### Scenario: Roster row shows level
- **WHEN** an administrator views the Student Roster and a certified student's class has `level = 'EMT'`
- **THEN** the student's class label includes `[EMT]`

#### Scenario: Pending approval row shows level
- **WHEN** an administrator views the Action Required approvals list and a pending student's class has `level = 'Critical Care'`
- **THEN** the student's class label includes `[Critical Care]`

#### Scenario: Student detail fact grid shows level
- **WHEN** an administrator views a student's profile at `/admin/students/<id>` and the student's class has `level = 'Community Paramedic'`
- **THEN** the training class fact grid or section displays the level

#### Scenario: Student with unleveled class shows no level
- **WHEN** an administrator views any student view and the student's class has `level = null`
- **THEN** the display shows no level indicator, matching current behavior
