## Purpose

Add help email configuration to the onboarding setup page so administrators can change the contact email shown during student onboarding without a code deploy.

## ADDED Requirements

### Requirement: Help email configuration on setup page
The `/admin/setup` page SHALL include a configuration section titled "Help Email" that allows administrators to view and edit the help contact email address displayed during student onboarding.

#### Scenario: Help email section is visible
- **WHEN** an admin navigates to `/admin/setup`
- **THEN** a "Help Email" card is displayed with a text input pre-filled with the current value and a save button

#### Scenario: Help email is saved
- **WHEN** an admin enters a new email address and clicks save
- **THEN** the `portal_settings` table is updated with the new `help_email` value
