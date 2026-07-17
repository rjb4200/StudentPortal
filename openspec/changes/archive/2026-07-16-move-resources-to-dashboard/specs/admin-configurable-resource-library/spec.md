## MODIFIED Requirements

### Requirement: Dynamic resource library rendering
The student resource library SHALL render active categories and active documents ordered by configured sort order. Documents SHALL be displayed within their parent category's scope. The library SHALL be available as a dashboard reference surface to pending and certified students and SHALL not require a completion acknowledgement or advance onboarding.

#### Scenario: Student sees active resources
- **WHEN** a pending or certified student opens the dashboard Resources section
- **THEN** the system displays all active categories with their active documents from the database in configured order

#### Scenario: Category with no active documents
- **WHEN** an active category has no active documents
- **THEN** the category is hidden from the student resource library

#### Scenario: Empty resource library
- **WHEN** no categories or documents are active
- **THEN** the resource library displays a clear empty state
