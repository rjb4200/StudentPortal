## ADDED Requirements

### Requirement: System Health operational layout
The System Health page SHALL use shared operational UI components for its page header, overall status banner, metric facts, check sections, operational alerts, empty states, and recent activity lists.

#### Scenario: Admin views system health with shared layout
- **WHEN** an authenticated admin opens `/admin/system`
- **THEN** the page uses the shared operational header, status banner, fact grid, section card, alert, and recent-list patterns while preserving existing health data and refresh behavior

#### Scenario: System health has no alerts
- **WHEN** the health API returns no operational alerts
- **THEN** the page displays a shared empty state or neutral empty message that is visually consistent with other admin operational screens

#### Scenario: System health reports an error
- **WHEN** the health API request fails or returns an error
- **THEN** the page displays the error using the shared alert pattern without exposing secret values
