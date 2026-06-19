## MODIFIED Requirements

### Requirement: Admin setup page access control

The admin setup page SHALL load setup data (welcome message template, help email, and child config components) only after confirming the current user has admin access via `canAccessAdmin()`. Unauthorized users SHALL see an "Access Denied" error message rather than triggering a client-side full-page redirect. The server-side middleware SHALL remain the primary authorization gate for `/admin/*` routes.

#### Scenario: Authorized admin loads setup page

- **WHEN** an authorized admin visits `/admin/setup`
- **THEN** the page confirms admin access via `supabase.auth.getUser()` and `canAccessAdmin()`
- **AND** only after confirmation does it fetch the welcome message, help email, and mount child config components
- **AND** the setup page renders normally with all config sections visible

#### Scenario: Unauthorized user sees access denied

- **WHEN** a user without the admin role somehow reaches the setup page client (middleware bypassed or session expired)
- **THEN** the page displays an "Access Denied" message
- **AND** no setup data queries are dispatched to Supabase
- **AND** no child config components are mounted
