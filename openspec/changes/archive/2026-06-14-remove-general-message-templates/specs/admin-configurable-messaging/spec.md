## MODIFIED Requirements

### Requirement: Messaging configuration security
The system SHALL restrict broadcast and welcome message writes to admin users. Authenticated students SHALL receive broadcasts and see the welcome message.

#### Scenario: Non-admin broadcast blocked
- **WHEN** a non-admin user attempts to create a broadcast
- **THEN** the database rejects the operation

#### Scenario: Anonymous user cannot receive broadcasts
- **WHEN** an unauthenticated user attempts to read broadcast messages
- **THEN** the database returns no results

## REMOVED Requirements

### Requirement: Admin message templates
**Reason**: General-purpose reusable reply/broadcast templates are no longer needed. Admins will compose replies and broadcasts directly while fixed welcome/completion messages remain separate.

**Migration**: Remove the Daily Ops template manager and template insertion dropdowns. Keep the `message_templates` table for fixed onboarding-related template types.
