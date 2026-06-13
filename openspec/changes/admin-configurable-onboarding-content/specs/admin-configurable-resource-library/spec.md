## ADDED Requirements

### Requirement: Admin-managed resource categories
The system SHALL allow admin users to create, edit, reorder, activate, and deactivate categories in the onboarding resource library.

#### Scenario: Create resource category
- **WHEN** an admin creates a category with name and sort order
- **THEN** the category is stored and appears in the student resource library when active

#### Scenario: Deactivate category
- **WHEN** an admin deactivates a category
- **THEN** the category and all its documents are hidden from the student resource library

### Requirement: Admin-managed resource documents
The system SHALL allow admin users to create, edit, reorder, activate, and delete downloadable documents within resource categories, including file URL entry and optional Supabase Storage upload.

#### Scenario: Add document via URL
- **WHEN** an admin adds a document with name, file URL, file type, category, and sort order
- **THEN** the document appears as a clickable download in the student resource library when active

#### Scenario: Add document via Supabase Storage upload
- **WHEN** an admin uploads a file to Supabase Storage and creates a document entry linked to that file
- **THEN** the document appears as a clickable download in the student resource library with a Supabase Storage URL

#### Scenario: Delete document
- **WHEN** an admin deletes a document
- **THEN** the document is removed from the resource library

### Requirement: Dynamic resource library rendering
The student onboarding resource library SHALL render active categories and active documents ordered by configured sort order.

#### Scenario: Student sees active resources
- **WHEN** a student reaches the resource library step
- **THEN** the system displays all active categories with their active documents from the database in configured order

#### Scenario: Category with no active documents
- **WHEN** an active category has no active documents
- **THEN** the category is hidden from the student resource library

#### Scenario: Empty resource library
- **WHEN** no categories or documents are active
- **THEN** the resource library step displays a message and allows immediate advancement
