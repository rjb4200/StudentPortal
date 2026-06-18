## MODIFIED Requirements

### Requirement: Admin-managed resource categories
The system SHALL allow admin users to create, edit, reorder, activate, and deactivate categories in the onboarding resource library. Reordering SHALL use ▲/▼ buttons with recalculation to guarantee unique sort_order values.

#### Scenario: Create resource category
- **WHEN** an admin creates a category with name and sort order
- **THEN** the category is stored and appears in the student resource library when active
- **AND** the new category's sort_order is set to the maximum existing sort_order plus 10

#### Scenario: Reorder resource category
- **WHEN** an admin clicks ▲ or ▼ on a resource category
- **THEN** the category swaps position and all categories' sort_order values are reassigned to clean multiples of 10

#### Scenario: Deactivate category
- **WHEN** an admin deactivates a category
- **THEN** the category and all its documents are hidden from the student resource library

### Requirement: Admin-managed resource documents
The system SHALL allow admin users to create, edit, reorder, activate, and delete downloadable documents within resource categories, including file URL entry and optional Supabase Storage upload. Reordering SHALL use ▲/▼ buttons with recalculation. Documents SHALL be loaded and sorted scoped to their parent category.

#### Scenario: Add document via URL
- **WHEN** an admin adds a document with name, file URL, file type, category, and sort order
- **THEN** the document appears as a clickable download in the student resource library when active
- **AND** the new document's sort_order is set to the maximum existing sort_order within that category plus 10

#### Scenario: Reorder document within category
- **WHEN** an admin clicks ▲ or ▼ on a document within a category
- **THEN** the document swaps position within that category's document list only
- **AND** all documents within that category are reassigned clean multiples of 10

#### Scenario: Add document via Supabase Storage upload
- **WHEN** an admin uploads a file to Supabase Storage and creates a document entry linked to that file
- **THEN** the document appears as a clickable download in the student resource library with a Supabase Storage URL

#### Scenario: Delete document
- **WHEN** an admin deletes a document
- **THEN** the document is removed from the resource library

### Requirement: Dynamic resource library rendering
The student onboarding resource library SHALL render active categories and active documents ordered by configured sort order. Documents SHALL be displayed within their parent category's scope.

#### Scenario: Student sees active resources
- **WHEN** a student reaches the resource library step
- **THEN** the system displays all active categories with their active documents from the database in configured order

#### Scenario: Category with no active documents
- **WHEN** an active category has no active documents
- **THEN** the category is hidden from the student resource library

#### Scenario: Empty resource library
- **WHEN** no categories or documents are active
- **THEN** the resource library step displays a message and allows immediate advancement
