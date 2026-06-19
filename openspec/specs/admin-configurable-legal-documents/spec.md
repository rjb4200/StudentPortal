# admin-configurable-legal-documents

**Purpose:** Allow training staff to manage the legal agreement documents students sign during onboarding (HIPAA, liability, custom documents) from the Admin Command Center without code changes.

## Requirements

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

### Requirement: Dynamic legal agreement rendering
The student onboarding legal step SHALL render all active legal documents ordered by configured sort order and enforce individual checkbox requirements.

#### Scenario: Student sees active legal documents
- **WHEN** a student reaches the legal agreements step
- **THEN** the system displays all active legal documents from the database in configured order

#### Scenario: Multiple checkbox requirement
- **WHEN** multiple active documents require checkboxes and the student checks only some
- **THEN** the system prevents advancement until all required checkboxes are checked

#### Scenario: No active documents
- **WHEN** no legal documents are active
- **THEN** the legal step displays a message and allows immediate advancement

### Requirement: Legal document signature
The system SHALL require the student to type their full legal name as an electronic signature before advancing past the legal step. The signature SHALL be captured server-side with real IP address and server-accurate timestamp. Each active document the student agreed to SHALL be recorded as an individual acceptance in a `student_legal_acceptances` table.

#### Scenario: Missing signature
- **WHEN** a student attempts to advance without typing their full legal name
- **THEN** the system displays a validation error and prevents advancement

#### Scenario: Signature recorded with real metadata
- **WHEN** a student completes the legal step
- **THEN** the student's IP address is captured from the request headers and stored in `signature_ip`
- **AND** the acceptance timestamp is the server's current time
- **AND** a row in `student_legal_acceptances` is created for each document the student agreed to
