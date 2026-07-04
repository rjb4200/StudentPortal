## ADDED Requirements

### Requirement: Student dashboard selective utility reuse
The student dashboard MAY use shared neutral UI utilities for alerts, empty states, loading states, and simple section cards, but it SHALL preserve the existing student-facing command-dashboard hierarchy and SHALL NOT adopt dense admin dossier layouts as the primary structure.

#### Scenario: Student dashboard shows neutral state
- **WHEN** the student dashboard displays an empty, loading, or error state
- **THEN** it may use the shared utility component with student-appropriate copy and actions

#### Scenario: Student dashboard preserves student visual hierarchy
- **WHEN** the student dashboard renders status-first header, summary cards, section navigation, or scheduling actions
- **THEN** those areas remain student-facing and do not become dense admin-style record views
