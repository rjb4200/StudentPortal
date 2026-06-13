# admin-configurable-legal-documents

**Purpose:** Allow training staff to manage the legal agreement documents students sign during onboarding (HIPAA, liability, custom documents) from the Admin Command Center without code changes.

## Requirements

### Requirement: Admin-managed legal documents
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete legal agreement documents displayed during onboarding.

#### Scenario: Create legal document
- **WHEN** an admin creates a legal document with title, body text, checkbox requirement flag, and sort order
- **THEN** the document is stored and displayed during student onboarding when active

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
The system SHALL require the student to type their full legal name as an electronic signature before advancing past the legal step.

#### Scenario: Missing signature
- **WHEN** a student attempts to advance without typing their full legal name
- **THEN** the system displays a validation error and prevents advancement
