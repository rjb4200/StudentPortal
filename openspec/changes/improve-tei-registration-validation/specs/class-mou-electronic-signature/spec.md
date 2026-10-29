## ADDED Requirements

### Requirement: Rendered MOU availability is required for signature submission
The instructor registration workflow SHALL prevent a signed MOU submission unless a non-empty rendered MOU is available for review. It SHALL provide an actionable error when the template is unavailable.

#### Scenario: MOU template cannot be loaded
- **WHEN** the MOU template is unavailable or cannot be rendered during step 4
- **THEN** the page states that the MOU cannot be submitted until the template is available
- **AND** the signed-MOU submit action is disabled
