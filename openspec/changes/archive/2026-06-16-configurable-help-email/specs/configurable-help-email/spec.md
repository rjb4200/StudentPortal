## ADDED Requirements

### Requirement: Help email prop interface
All onboarding step components SHALL accept an optional `helpEmail` prop. When provided, the component SHALL display that email in the help footer instead of any hardcoded value. When not provided, the component SHALL fall back to `jbrown@winchesterky.com`.

#### Scenario: Step component renders with provided help email
- **WHEN** the registration form receives `helpEmail="admin@example.com"`
- **THEN** the help footer displays "Need help? Contact your instructor or email admin@example.com"

#### Scenario: Step component renders with no help email prop
- **WHEN** the registration form does not receive a `helpEmail` prop
- **THEN** the help footer displays "Need help? Contact your instructor or email jbrown@winchesterky.com"

#### Scenario: All five steps display the same help email
- **WHEN** the onboarding page passes the same `helpEmail` to all five step components
- **THEN** every step shows the same email address in its help footer
