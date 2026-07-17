## MODIFIED Requirements

### Requirement: Clear dashboard section navigation
The dashboard SHALL replace opaque local feature tabs with clearer section navigation organized around student jobs-to-be-done: Schedule, Resources, Messages, and Calendar Feed. Resources, Messages, and Calendar Feed SHALL be available to pending and certified students; Schedule SHALL remain locked until certification.

#### Scenario: Pending student navigates available sections
- **WHEN** a pending student opens the dashboard
- **THEN** Resources, Messages, and Calendar Feed are available
- **AND** Schedule remains locked until certification

#### Scenario: Student navigates dashboard sections
- **WHEN** a student uses the dashboard navigation
- **THEN** section labels clearly describe the work available in each section
- **AND** navigation remains usable on desktop and mobile screen sizes

### Requirement: Dashboard resource library
The dashboard SHALL provide a Resources section that renders active resource categories and documents as ongoing study and reference materials. The section SHALL not require acknowledgement, affect onboarding completion, or contain onboarding advancement controls.

#### Scenario: Student reads reference materials
- **WHEN** a pending or certified student opens Resources
- **THEN** the dashboard displays active categories and documents in configured order
- **AND** the student can open each available document or embedded map

#### Scenario: No active resources
- **WHEN** no active categories contain active documents
- **THEN** the Resources section displays a clear empty state

## REMOVED Requirements

### Requirement: Preceptor gallery
**Reason**: Preceptors & Evaluations is removed from the dashboard for now so Resources can occupy the section.
**Migration**: Preserve preceptor components and data for a future dashboard reintroduction.

### Requirement: Clinical evaluation submission
**Reason**: Preceptors & Evaluations is removed from the dashboard for now so Resources can occupy the section.
**Migration**: Preserve evaluation components, records, and admin analytics for a future dashboard reintroduction.
