## ADDED Requirements

### Requirement: Server-side auth user management
The system SHALL provide server-side API routes for creating, updating passwords for, and deleting Supabase Auth users using the service role key, so that these operations can be called from the admin client-side UI without exposing the service role key to the browser.

#### Scenario: Create auth user via API
- **WHEN** `POST /api/admin/create-auth-user` is called with email, password, and role
- **THEN** a Supabase Auth user is created and the user ID is returned

#### Scenario: Update auth user password via API
- **WHEN** `PUT /api/admin/update-auth-user` is called with user ID and new password
- **THEN** the auth user's password is updated

#### Scenario: Delete auth user via API
- **WHEN** `DELETE /api/admin/delete-auth-user` is called with a user ID
- **THEN** the Supabase Auth user is deleted

### Requirement: Account Management page uses API routes
The Account Management page SHALL use the server-side API routes for auth user operations instead of calling `createAdminClient()` directly in the browser.

#### Scenario: Save admin account completes
- **WHEN** an admin creates or edits an admin account and clicks Save
- **THEN** the auth user is created or updated via the API route, the `admin_accounts` row is upserted, and the spinner stops

#### Scenario: Delete admin account completes
- **WHEN** an admin deletes an admin account
- **THEN** the auth user is deleted via the API route, the `admin_accounts` row is removed, and the UI updates
