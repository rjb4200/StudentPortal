## MODIFIED Requirements

### Requirement: Crimson hero public page layout
The system SHALL provide a crimson hero layout for public-facing pages (`/`, `/login`, and `/onboarding`) featuring a full-viewport crimson background with a dark radial vignette overlay, the WFD department logo, serif typography for display headings, and a white content card. The layout SHALL be responsive: two-column on desktop for `/` and `/login` (branding left, card right), and centered single-column for the `/onboarding` multi-step wizard. The layout SHALL include a slim charcoal footer with copyright text. All public pages SHALL share the same brand identity — logo, colors, typography, and footer.

#### Scenario: Desktop two-column layout for landing and login
- **WHEN** a user visits `/` or `/login` on a screen wider than 1024px
- **THEN** the page renders a crimson background with the WFD logo and serif branding text in the left column and a white content card in the right column

#### Scenario: Centered single-column layout for onboarding
- **WHEN** a user visits `/onboarding`
- **THEN** the page renders a crimson background with the WFD logo and serif branding centered at the top
- **AND** the white content card is centered below the branding block
- **AND** the charcoal footer appears at the bottom

#### Scenario: Mobile stacked layout
- **WHEN** a user visits `/`, `/login`, or `/onboarding` on a screen narrower than 1024px
- **THEN** the branding block and content card stack vertically in a single column

#### Scenario: Footer on all public pages
- **WHEN** a user visits `/`, `/login`, or `/onboarding`
- **THEN** a slim charcoal footer bar is displayed with text "© Winchester Fire Department · Division of EMS"
