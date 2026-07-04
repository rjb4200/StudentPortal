## ADDED Requirements

### Requirement: Student profile as operational UI source pattern
The admin student profile SHALL remain the visual baseline for shared operational UI components. Any component extraction or refactor involving the profile SHALL preserve its existing record-summary, fact-grid, disclosure, badge, alert, and compact-table behavior.

#### Scenario: Student profile is refactored to shared components
- **WHEN** shared operational components are introduced into the student profile
- **THEN** the page remains visually equivalent in structure and preserves existing route access, data display, warnings, disclosures, filters, actions, and print behavior

#### Scenario: Shared profile patterns are reused elsewhere
- **WHEN** another admin screen uses a shared fact grid, section card, alert, disclosure, or data table component
- **THEN** the rendered pattern remains recognizable as the same operational record style used by the student profile
