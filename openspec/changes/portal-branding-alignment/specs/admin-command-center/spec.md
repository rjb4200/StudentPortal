## ADDED Requirements

### Requirement: Admin command center uses WFD design tokens
The admin pages SHALL use charcoal-tinted grays for structural elements and WFD crimson for active/selected states. Delete and danger actions SHALL use `wfd-crimson` — not hardcoded `bg-red-600` or `text-red-700`. Status badges and activity indicators SHALL use the WFD palette.

#### Scenario: Admin tabs use WFD crimson for active state
- **WHEN** an admin views the command center
- **THEN** the active tab SHALL be indicated with `border-wfd-crimson` and `text-wfd-crimson`

#### Scenario: Danger actions use WFD crimson
- **WHEN** a delete button or blacklist toggle is rendered
- **THEN** the button SHALL use `wfd-crimson` as its primary color — not `bg-red-600`
