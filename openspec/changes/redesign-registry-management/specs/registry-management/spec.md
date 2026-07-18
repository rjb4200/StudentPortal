## ADDED Requirements

### Requirement: Classes-first registry workspace
The system SHALL present the Registry tab as a classes-first administrative workspace with Classes, Instructors, and Training Sites views. The Classes view SHALL be selected when the Registry tab first opens, and creation controls SHALL be scoped to the entity view selected by the administrator.

#### Scenario: Registry opens to class management
- **WHEN** an administrator opens `/admin?tab=registry`
- **THEN** the Registry displays class management as the selected view without rendering unrelated creation forms ahead of the class workspace

#### Scenario: Administrator changes entity view
- **WHEN** an administrator selects the Instructors or Training Sites view
- **THEN** the Registry displays records and an entity-appropriate creation action for the selected view

### Requirement: Registry overview and class lifecycle visibility
The system SHALL show registry summary counts and an attention area for actionable registry conditions. For each class, the system SHALL display its stored registry status and a derived lifecycle of Upcoming, In progress, or Expired based on the class date window and current application date.

#### Scenario: Expired active class is surfaced
- **WHEN** an active class has a ride-time end date before the current application date
- **THEN** the Registry attention area identifies the expired active class and the Classes view displays its Expired lifecycle separately from its active status

#### Scenario: No actionable registry conditions
- **WHEN** there are no pending records, active expired classes, or other configured attention conditions
- **THEN** the Registry displays a clear no-attention state without hiding the entity lists

### Requirement: Searchable and filterable registry records
The system SHALL allow administrators to search and filter Registry records within the selected entity view. The Classes view SHALL support filtering by stored status and derived lifecycle; all entity views SHALL preserve enough identifying and relationship information for an administrator to distinguish records.

#### Scenario: Administrator filters expired classes
- **WHEN** an administrator filters Classes by the Expired lifecycle
- **THEN** the Registry displays only classes whose ride-time end date is before the current application date

#### Scenario: Administrator searches an instructor
- **WHEN** an administrator searches the Instructors view by an instructor name or email
- **THEN** the Registry displays matching instructor records and a clear empty state when no records match

### Requirement: Class relationship and enrollment context
The Classes view SHALL display each class's associated training site, instructor, date window, and enrolled-student count. An administrator SHALL be able to inspect enrolled students for a class and navigate to an existing enrolled student's admin profile.

#### Scenario: Class with enrolled students
- **WHEN** an administrator opens the detail view for a class that has linked students
- **THEN** the Registry displays the enrolled students and provides a link to each available `/admin/students/<student-id>` profile

#### Scenario: Class without enrolled students
- **WHEN** a class has no linked students
- **THEN** the Classes view displays an enrolled-student count of zero and does not render an invalid roster link

### Requirement: Full registry record editing
The system SHALL provide focused create and edit flows for training sites, instructors, and training classes. Each edit flow SHALL expose every existing editable field stored for that entity and SHALL preserve server-side validation of class date windows and instructor/site association.

#### Scenario: Administrator edits instructor contact details
- **WHEN** an administrator edits an instructor record
- **THEN** the form displays the instructor's existing contact, credential, title, preference, and site-association fields and saves validated changes through the admin registry API

#### Scenario: Administrator enters an invalid class window
- **WHEN** an administrator submits a class with a ride-time end date before its class start date
- **THEN** the system rejects the save and displays an actionable validation error without changing the stored class

### Requirement: Contextual and safe registry lifecycle actions
The system SHALL show only status actions that are meaningful for the record's current status. Reject, suspend, and archive actions SHALL require accessible confirmation identifying the affected record. Activating a class from a non-active status SHALL preserve the existing approval notification behavior.

#### Scenario: Active record actions
- **WHEN** an administrator views an active registry record
- **THEN** the Registry does not offer an Approve action and offers only applicable maintenance actions

#### Scenario: Administrator archives a record
- **WHEN** an administrator selects Archive for an applicable registry record
- **THEN** the system displays a confirmation dialog naming the record before applying the archived status

#### Scenario: Administrator reactivates a suspended class
- **WHEN** an administrator reactivates a suspended class
- **THEN** the class status becomes active and the existing class approval notification behavior runs for the activation transition

### Requirement: Responsive and accessible registry management
The Registry workspace SHALL use the shared admin operational UI patterns and remain usable with keyboard navigation and at mobile and desktop viewport widths. Responsive presentation SHALL retain each record's primary identity, relationships, statuses, and available actions.

#### Scenario: Keyboard operation
- **WHEN** an administrator uses keyboard navigation within Registry tabs, filters, record actions, and confirmation dialogs
- **THEN** controls have visible focus and can be operated without a pointer

#### Scenario: Mobile registry view
- **WHEN** an administrator views the Registry at a narrow viewport width
- **THEN** each record remains readable and exposes its primary information and actions without requiring a three-column layout
