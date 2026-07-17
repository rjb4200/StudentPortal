# admin-configurable-resource-library

## Purpose
Allow training staff to manage the onboarding resource library (categories and downloadable documents) from the Admin Command Center without code changes. Supports file URL entry and Supabase Storage upload.
## Requirements
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

### Requirement: Resource documents support embedded map iframes

The system SHALL allow resource documents to optionally include a Google Maps embed URL (`map_embed_url`). When a document has a non-null `map_embed_url`, the student-facing resource library SHALL render an interactive embedded map iframe below the document download link. The iframe SHALL use standard Google Maps embed attributes: `width="100%"`, `height="300"`, `style="border:0; border-radius:0.5rem;"`, `allowfullscreen`, `loading="lazy"`, and `referrerpolicy="no-referrer-when-downgrade"`. Documents without a `map_embed_url` SHALL render identically to their current behavior.

#### Scenario: Document with map embed URL shows interactive map

- **WHEN** a student views the resource library and a document has a `map_embed_url` set to a valid Google Maps embed URL
- **THEN** an interactive iframe map is rendered below the document name and download link
- **AND** the map displays the station location and supports pan/zoom

#### Scenario: Document without map embed URL shows no map

- **WHEN** a student views the resource library and a document has a `null` or empty `map_embed_url`
- **THEN** the document renders as a standard download link with no map iframe
- **AND** the layout is identical to the pre-change behavior

#### Scenario: Admin adds a map embed URL to a document

- **WHEN** an admin creates or edits a resource document with a `map_embed_url` value
- **THEN** the URL is stored in the database
- **AND** the embedded map appears when students view the resource library
