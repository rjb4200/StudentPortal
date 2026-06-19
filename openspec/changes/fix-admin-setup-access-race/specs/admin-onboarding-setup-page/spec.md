## MODIFIED Requirements

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
