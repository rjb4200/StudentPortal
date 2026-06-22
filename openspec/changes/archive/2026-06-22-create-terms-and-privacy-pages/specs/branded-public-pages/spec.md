## MODIFIED Requirements

### Requirement: Crimson hero public page layout

The system SHALL provide a crimson hero layout for public-facing pages (`/`, `/login`, `/onboarding`, `/privacy-policy`, and `/terms-and-conditions`) featuring a full-viewport crimson background with a dark radial vignette overlay, the WFD department logo, serif typography for display headings, and a white content card. The layout SHALL be responsive: two-column on desktop for all pages (branding left, card right). On mobile (below 1024px), all pages SHALL stack vertically in a single column with a reduced logo size. The layout SHALL include a slim charcoal footer with copyright text and links to the privacy policy and terms pages.

#### Scenario: Footer on all public pages

- **WHEN** a user visits `/`, `/login`, `/onboarding`, `/privacy-policy`, or `/terms-and-conditions`
- **THEN** a slim charcoal footer bar is displayed with text "© Winchester Fire Department · Division of EMS" and links to "Privacy Policy" (`/privacy-policy`) and "Terms & Conditions" (`/terms-and-conditions`)
