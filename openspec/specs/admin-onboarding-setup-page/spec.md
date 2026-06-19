# admin-onboarding-setup-page

## Purpose
Move all onboarding configuration components (quiz rules, registration fields, legal documents, resource library, welcome message) to a dedicated `/admin/setup` page accessible via a hamburger menu, uncluttering the Daily Operations and Maintenance & Archive tabs.
## Requirements
### Requirement: Dedicated onboarding setup page

The Admin Command Center SHALL provide a dedicated page at `/admin/setup` that contains all five onboarding configuration components. The page SHALL load setup data (welcome message template, help email, and child config components) only after confirming the current user has admin access via `canAccessAdmin()`. Unauthorized users SHALL see an "Access Denied" error message rather than triggering a client-side full-page redirect. The server-side middleware SHALL remain the primary authorization gate for `/admin/*` routes.

#### Scenario: Admin navigates to setup page

- **WHEN** an admin navigates to `/admin/setup`
- **THEN** the page confirms admin access before fetching setup data
- **AND** the page displays the quiz configuration, registration fields, legal documents, resource library, and welcome message sections

#### Scenario: Non-admin access blocked

- **WHEN** a non-admin user navigates to `/admin/setup`
- **THEN** the page displays an "Access Denied" message
- **AND** no setup data queries are dispatched to Supabase
- **AND** no child config components are mounted

### Requirement: Hamburger menu navigation
The Admin Command Center header SHALL include a hamburger icon that opens a dropdown menu containing a link to the Onboarding Setup page.

#### Scenario: Admin opens hamburger menu
- **WHEN** an admin clicks the hamburger icon in the Admin Command Center header
- **THEN** a dropdown menu appears with an "Onboarding Setup" link

#### Scenario: Navigate via hamburger menu
- **WHEN** an admin clicks the "Onboarding Setup" link in the hamburger dropdown
- **THEN** the browser navigates to `/admin/setup`

### Requirement: Welcome message placeholder in Daily Ops
The Daily Operations messaging section SHALL replace the full welcome message editor with a read-only card that displays the current welcome message preview and a link to edit it on the Onboarding Setup page.

#### Scenario: Admin sees welcome message preview
- **WHEN** an admin views the Daily Ops messaging section
- **THEN** a card displays the current welcome message title and a truncated body preview

#### Scenario: No welcome message configured
- **WHEN** no welcome message is active
- **THEN** the placeholder card shows a message indicating no welcome message is configured and a link to create one

#### Scenario: Navigate to edit welcome message
- **WHEN** an admin clicks the "Edit in Onboarding Setup" link in the welcome preview card
- **THEN** the browser navigates to `/admin/setup`

### Requirement: Cleaned Maintenance & Archive tab
The Maintenance & Archive tab SHALL contain only operational tools: master export, data purge, and aggregate iCal feed. Onboarding configuration components SHALL be removed from this tab.

#### Scenario: Admin views Maintenance & Archive
- **WHEN** an admin selects the Maintenance & Archive tab
- **THEN** the tab displays Master Export, Purge Data, and Aggregate iCal Feed sections but no onboarding configuration components

