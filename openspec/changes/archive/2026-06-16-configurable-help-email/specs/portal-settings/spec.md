## ADDED Requirements

### Requirement: Portal settings key/value storage
The system SHALL provide a `portal_settings` table with `key` (text, primary key), `value` (text), and `updated_at` (timestamptz) columns. The table SHALL be seeded with a default `help_email` value of `jbrown@winchesterky.com`.

#### Scenario: Default setting exists after migration
- **WHEN** the migration is applied
- **THEN** a row with `key = 'help_email'` and `value = 'jbrown@winchesterky.com'` exists in the `portal_settings` table

#### Scenario: Setting can be updated
- **WHEN** an admin updates the `help_email` value
- **THEN** the `updated_at` timestamp is set to the current time

### Requirement: Public settings API endpoint
The system SHALL provide a `GET /api/settings?key=<key>` endpoint that returns the value for a given setting key from `portal_settings`. The endpoint SHALL be accessible without authentication. If the key does not exist, the endpoint SHALL return a 200 with a null value.

#### Scenario: Fetch existing setting
- **WHEN** a GET request is made to `/api/settings?key=help_email`
- **THEN** the response includes `{ "key": "help_email", "value": "jbrown@winchesterky.com" }`

#### Scenario: Fetch missing setting
- **WHEN** a GET request is made to `/api/settings?key=nonexistent`
- **THEN** the response includes `{ "key": "nonexistent", "value": null }`

### Requirement: Admin UI for help email
The `/admin/setup` page SHALL include a card section with a text input field for editing the `help_email` portal setting and a save button. The section SHALL load the current value on mount and persist changes to `portal_settings` on save.

#### Scenario: Admin views current help email
- **WHEN** an admin navigates to `/admin/setup`
- **THEN** a "Help Email" card displays the current `help_email` value in a text input

#### Scenario: Admin updates help email
- **WHEN** an admin changes the help email value and clicks save
- **THEN** the `portal_settings` table is updated with the new value and a success confirmation is shown

#### Scenario: Non-admin cannot access setup page
- **WHEN** a non-admin user navigates to `/admin/setup`
- **THEN** the system redirects to `/login`

### Requirement: Onboarding reads help email from settings
The onboarding page SHALL fetch the help email from the settings API and pass it to all step components. If the setting is not configured or the fetch fails, the system SHALL fall back to `jbrown@winchesterky.com`.

#### Scenario: Help email shown from database
- **WHEN** a student views any onboarding step and the `help_email` setting is configured
- **THEN** the help footer displays the email from the database

#### Scenario: Help email falls back to default
- **WHEN** a student views any onboarding step and the `help_email` setting fetch fails or returns null
- **THEN** the help footer displays `jbrown@winchesterky.com`
