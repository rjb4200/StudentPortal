## ADDED Requirements

### Requirement: Admin operational component library
The system SHALL provide reusable UI components that encode the admin operational record pattern used by the student profile, including page headers, section cards, status banners, alerts, empty states, loading states, confirmation dialogs, tabs, data tables, form fields, and fact grids.

#### Scenario: Shared components are available
- **WHEN** an admin screen needs a repeated operational UI pattern
- **THEN** the screen can import the appropriate shared component from the application's UI component layer instead of duplicating ad hoc markup

#### Scenario: Components match the student profile pattern
- **WHEN** shared operational components render on admin screens
- **THEN** they use the student profile visual language of compact labeled facts, subtle borders, rounded gray insets, status badges, and optional left accent borders

### Requirement: Accessible interaction states
Interactive operational UI components SHALL provide accessible keyboard and focus behavior using visible focus states, appropriate native elements or ARIA roles, and disabled/loading states that are perceivable.

#### Scenario: Keyboard user navigates shared controls
- **WHEN** a keyboard user tabs through buttons, tabs, fields, disclosure controls, and confirmation dialog actions
- **THEN** each interactive control exposes a visible focus state and can be operated without a mouse

#### Scenario: Loading action is disabled
- **WHEN** an action component is in a loading state
- **THEN** the action is disabled or otherwise protected from duplicate submission and communicates that work is in progress

### Requirement: Reusable confirmation dialog
The system SHALL provide a reusable confirmation dialog for admin destructive or high-impact actions. The dialog SHALL clearly name the action, explain the consequence, provide cancel and confirm actions, and avoid relying on native browser confirmation dialogs for migrated flows.

#### Scenario: Admin cancels destructive action
- **WHEN** an admin opens a confirmation dialog for a destructive action and chooses cancel
- **THEN** the destructive action is not executed and the dialog closes

#### Scenario: Admin confirms destructive action
- **WHEN** an admin opens a confirmation dialog for a destructive action and chooses the confirm action
- **THEN** the system executes the requested action and displays the existing success or error feedback for that workflow

### Requirement: Operational data table pattern
The system SHALL provide a reusable compact data table pattern for admin record lists. The table SHALL support profile-style uppercase column headers, subtle row dividers, optional row striping or hover states, and responsive horizontal overflow.

#### Scenario: Admin views tabular records
- **WHEN** an admin screen displays operational records in a shared data table
- **THEN** headers, row spacing, badges, and responsive overflow match the profile-style table pattern

### Requirement: Fact grid pattern
The system SHALL provide a reusable fact grid pattern for compact labeled values. Each fact item SHALL display a small uppercase label and a value area that supports text, badges, or custom content.

#### Scenario: Admin views summary facts
- **WHEN** an admin screen displays summary metadata for a record or system state
- **THEN** the values appear as compact labeled fact cells consistent with the student profile summary card

### Requirement: Selective student-facing reuse
Student-facing screens MAY use neutral shared utility components such as alerts, loading states, empty states, and simple section cards, but SHALL NOT adopt the full admin dossier layout unless the content is record/history oriented.

#### Scenario: Student screen uses neutral utility component
- **WHEN** a student dashboard area has an empty, loading, or alert state
- **THEN** it may render the shared utility component while preserving the student-facing page hierarchy and tone

#### Scenario: Student screen avoids admin dossier styling
- **WHEN** a student-facing page presents onboarding or primary student actions
- **THEN** it does not use dense admin-only fact grids or disclosure stacks as the dominant page structure
