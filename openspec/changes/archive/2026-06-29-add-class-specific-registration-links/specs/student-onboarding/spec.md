## ADDED Requirements

### Requirement: Class-specific onboarding link
The system SHALL support class-specific student onboarding links at `/onboarding?class=<training_class_id>`. When the provided class id matches a currently visible public class option, the registration form SHALL preselect that class, SHALL clearly identify the selected training site/class, and SHALL prevent accidental changes to the class selection. Registration submitted from a class-specific link SHALL save the selected `training_class_id`, `training_site_id`, and `instructor_id` through the existing server-side registration path.

#### Scenario: Valid class link preselects class
- **WHEN** a student opens `/onboarding?class=<training_class_id>` for a class that is active, within its visibility window, connected to an active training site, and connected to an active instructor
- **THEN** the registration form preselects the matching training site/class option
- **AND** the form explains that the registration link is tied to that class
- **AND** the student cannot accidentally choose a different class from the locked class-specific selection

#### Scenario: Class link registration saves class relationship
- **WHEN** a student submits registration from a valid class-specific onboarding link
- **THEN** the created student row is associated with the selected `training_class_id`
- **AND** the created student row is associated with the class's `training_site_id`
- **AND** the created student row is associated with the class's `instructor_id`

#### Scenario: Invalid class link is rejected by the form
- **WHEN** a student opens `/onboarding?class=<training_class_id>` and the class id is missing, invalid, expired, future-hidden, suspended, archived, rejected, or otherwise unavailable for public registration
- **THEN** the registration form displays a clear message that the class registration link is not available
- **AND** the form does not silently register the student under that class

#### Scenario: Tampered class id is rejected during registration
- **WHEN** a caller submits registration with a `trainingClassId` that is not available for public registration
- **THEN** the server-side registration path rejects the request
- **AND** no student row is registered under the unavailable class
