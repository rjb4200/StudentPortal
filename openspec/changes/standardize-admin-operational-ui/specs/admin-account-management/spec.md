## ADDED Requirements

### Requirement: Account Management operational UI pattern
The Account Management page SHALL use shared operational UI components for account tabs, account lists, edit forms, form feedback, loading states, and destructive confirmations while preserving existing account-management behavior.

#### Scenario: Admin switches account tabs
- **WHEN** an admin switches between admin, preceptor, and student account views
- **THEN** the tab controls use the shared tabs pattern and continue to show the selected account type's records

#### Scenario: Admin edits account form
- **WHEN** an admin creates or edits an admin, preceptor, or student account
- **THEN** the form uses shared form-field and section-card patterns while preserving validation, save behavior, and existing editable fields

#### Scenario: Admin performs destructive account action
- **WHEN** an admin disables, deletes, or resets an account through a migrated destructive flow
- **THEN** the flow uses the shared confirmation dialog and only performs the action after explicit confirmation
