## MODIFIED Requirements

### Requirement: Crimson hero public page layout

The system SHALL provide a crimson hero layout for public-facing pages (`/`, `/login`, and `/onboarding`) featuring a full-viewport crimson background with a dark radial vignette overlay, the WFD department logo, serif typography for display headings, and a white content card. The layout SHALL be responsive: two-column on desktop for all three pages (branding left, card right). The `/onboarding` layout SHALL use a compact branding pane with a smaller logo to give more space to the multi-field registration form on the right. On mobile (below 1024px), all pages SHALL stack vertically in a single column with a reduced logo size. The layout SHALL include a slim charcoal footer with copyright text.

#### Scenario: Desktop two-column layout for landing and login

- **WHEN** a user visits `/` or `/login` on a screen wider than 1024px
- **THEN** the page renders a crimson background with the WFD logo and serif branding text in the left column and a white content card in the right column

#### Scenario: Desktop two-column layout with compact branding for onboarding

- **WHEN** a user visits `/onboarding` on a screen wider than 1024px
- **THEN** the page renders a crimson background with a compact WFD logo and serif branding in the left column
- **AND** a wider white content card appears in the right column to accommodate multi-field forms
- **AND** the branding pane is visually smaller than on `/` and `/login` to prioritize form space

#### Scenario: Mobile stacked layout

- **WHEN** a user visits `/`, `/login`, or `/onboarding` on a screen narrower than 1024px
- **THEN** the branding block and content card stack vertically in a single column
- **AND** the WFD logo is sized smaller than on desktop to keep the form card visible without excessive scrolling

#### Scenario: Footer on all public pages

- **WHEN** a user visits `/`, `/login`, or `/onboarding`
- **THEN** a slim charcoal footer bar is displayed with text "© Winchester Fire Department · Division of EMS"
