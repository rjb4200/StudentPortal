## ADDED Requirements

### Requirement: Canonical auth and account URLs
The system SHALL define a canonical public StudentPortal app URL for user-facing authentication and account links. Password reset redirects and transactional email CTA links SHALL use supported StudentPortal routes derived from that canonical URL rather than deriving public links from arbitrary request or browser origins.

#### Scenario: Password reset redirect uses supported route
- **WHEN** a user requests a password reset from the login page
- **THEN** the Supabase password reset redirect target is the canonical app URL plus `/reset-password`

#### Scenario: Account notification links use canonical app URL
- **WHEN** the system sends onboarding completion, account approval, or schedule notification email to a student
- **THEN** the email CTA points to the canonical app URL plus `/login` or `/dashboard` as appropriate

#### Scenario: Hosted auth settings are documented
- **WHEN** deployment configuration is reviewed
- **THEN** the documented Supabase Auth Site URL and redirect URL patterns match the canonical production StudentPortal URL and supported auth/account routes
