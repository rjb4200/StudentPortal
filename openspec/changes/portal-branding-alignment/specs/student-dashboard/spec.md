## ADDED Requirements

### Requirement: Dashboard uses WFD design tokens
The dashboard page SHALL NOT use hardcoded Tailwind color utilities (`amber-*`, `blue-*`) for alert cards, status indicators, or interactive elements. Pending approval cards SHALL use gold-bordered styling. Welcome message cards SHALL use sage or charcoal-bordered styling. Tab buttons SHALL use charcoal-tinted inactive states.

#### Scenario: Pending approval card uses gold styling
- **WHEN** a student with `pending` status loads the dashboard
- **THEN** the pending approval card SHALL have a gold-tinted border and background using `wfd-gold` tokens — not `amber-*`

#### Scenario: Welcome message card uses sage styling
- **WHEN** a certified student loads the dashboard
- **THEN** the welcome message card SHALL have a sage or charcoal-tinted border and background — not `blue-*`
