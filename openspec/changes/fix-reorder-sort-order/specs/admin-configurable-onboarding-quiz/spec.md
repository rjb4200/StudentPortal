## MODIFIED Requirements

### Requirement: Admin-managed quiz rules
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete onboarding quiz rules from the Admin Command Center. Reordering SHALL use ▲/▼ buttons with recalculation to guarantee unique sort_order values.

#### Scenario: Create quiz rule
- **WHEN** an admin creates a rule with title, rule text, instruction, sort order, and active state
- **THEN** the rule is stored and available for quiz configuration management
- **AND** the new rule's sort_order is set to the maximum existing sort_order plus 10

#### Scenario: Reorder quiz rule up
- **WHEN** an admin clicks ▲ on a quiz rule
- **THEN** the rule swaps position with the rule above it
- **AND** all rules' sort_order values are reassigned to clean multiples of 10

#### Scenario: Deactivate quiz rule
- **WHEN** an admin deactivates a rule
- **THEN** the rule is hidden from future student onboarding quiz sessions

### Requirement: Admin-managed quiz photos
The system SHALL allow admin users to manage 4-6 photos for each quiz rule, including label, image URL, non-compliant answer flag, explanation, sort order, and active state. Reordering SHALL use ▲/▼ buttons with recalculation. Photos SHALL be loaded and sorted scoped to their parent rule.

#### Scenario: Add photo answer
- **WHEN** an admin adds a photo to a rule and marks whether it is non-compliant
- **THEN** the photo is included in that rule's student question when active
- **AND** the new photo's sort_order is set to the maximum existing sort_order within that rule plus 10

#### Scenario: Reorder photo within rule
- **WHEN** an admin clicks ▲ or ▼ on a photo within a rule
- **THEN** the photo swaps position within that rule's photo list only
- **AND** all photos within that rule are reassigned clean multiples of 10

#### Scenario: Invalid active rule content
- **WHEN** an admin attempts to activate a rule with fewer than 4 active photos, more than 6 active photos, or zero non-compliant photos
- **THEN** the system prevents activation and displays a validation message

### Requirement: Student quiz uses active database configuration
The onboarding knowledge gate SHALL load active quiz rules and active quiz photos from Supabase, ordered by admin-defined sort order. Quiz photos SHALL be loaded scoped to their parent rule.

#### Scenario: Student starts quiz
- **WHEN** a student reaches the knowledge gate
- **THEN** the system displays active quiz rules from Supabase in configured order
- **AND** photos for each rule are loaded and ordered within that rule's scope

#### Scenario: Inactive content hidden
- **WHEN** a rule or photo is inactive
- **THEN** it is not shown to students in the onboarding quiz
