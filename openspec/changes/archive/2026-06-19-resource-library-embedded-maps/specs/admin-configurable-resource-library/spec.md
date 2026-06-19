## ADDED Requirements

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
