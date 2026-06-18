## MODIFIED Requirements

### Requirement: Admin-managed legal documents
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete legal agreement documents displayed during onboarding. Reordering SHALL use ▲/▼ buttons with recalculation to guarantee unique sort_order values.

#### Scenario: Create legal document
- **WHEN** an admin creates a legal document with title, body text, checkbox requirement flag, and sort order
- **THEN** the document is stored and displayed during student onboarding when active
- **AND** the new document's sort_order is set to the maximum existing sort_order plus 10

#### Scenario: Reorder legal document up
- **WHEN** an admin clicks ▲ on a legal document
- **THEN** the document swaps position with the document above it
- **AND** all documents' sort_order values are reassigned to clean multiples of 10

#### Scenario: Edit legal document text
- **WHEN** an admin edits the body text of an active legal document
- **THEN** the updated text appears during future student onboarding sessions without a redeploy

#### Scenario: Toggle checkbox requirement
- **WHEN** an admin marks a legal document as not requiring a checkbox
- **THEN** the student onboarding flow displays the document text but does not require the student to check agreement

#### Scenario: Deactivate legal document
- **WHEN** an admin deactivates a legal document
- **THEN** the document is hidden from future student onboarding sessions
