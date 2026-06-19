# branded-public-pages Specification

## Purpose
Crimson hero design system for public-facing pages featuring full-viewport WFD-branded layouts with logo, serif typography, dark vignette, responsive two-column architecture, and consistent white card + charcoal footer pattern.
## Requirements
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

### Requirement: Branded landing page
The landing page (`/`) SHALL display a white card containing a "Welcome" heading, a CTA button for "Begin Student Onboarding" linking to `/onboarding`, a CTA button for "Sign In" linking to `/login`, and two secondary action boxes ("New student?" linking to `/onboarding` and "Need help?" with a mailto link).

#### Scenario: New student clicks onboarding
- **WHEN** a user clicks "Begin Student Onboarding" on the landing page
- **THEN** the browser navigates to `/onboarding`

#### Scenario: Returning student clicks sign in
- **WHEN** a user clicks "Sign In" on the landing page
- **THEN** the browser navigates to `/login`

### Requirement: Branded login page
The login page (`/login`) SHALL display a white card containing a student/admin toggle, "Welcome back" heading, email and password input fields with labels, a "Forgot password?" link, a full-width crimson "Sign In" button, and two secondary action boxes ("New student?" and "Need help?"). All existing login behavior (student auth, admin auth, password reset, status messages from query params) SHALL be preserved unchanged.

#### Scenario: Student login form visible
- **WHEN** the student/admin toggle is set to "Student"
- **THEN** the email and password fields are displayed with a crimson "Sign In" button

#### Scenario: Admin login form visible
- **WHEN** the student/admin toggle is set to "Admin"
- **THEN** the email and password fields are displayed with a charcoal "Sign In" button

#### Scenario: Login error displayed
- **WHEN** a user submits invalid credentials
- **THEN** an error message is displayed in a crimson-tinted alert box within the login card

#### Scenario: Status message from query param
- **WHEN** a user arrives at `/login?reason=expired`
- **THEN** a warning message with a "Re-register" action link is displayed within the login card

#### Scenario: Forgot password flow
- **WHEN** a user clicks "Forgot password?" and enters their email
- **THEN** a success message is displayed confirming the reset email was sent

### Requirement: Public page typography
The public pages SHALL use EB Garamond (serif) for display text (department label, "EMS Student Portal" heading, "Welcome back" heading, tagline) and Roboto Condensed (sans-serif) for UI elements (form labels, inputs, buttons, links, secondary action boxes).

#### Scenario: Serif display text
- **WHEN** the department label "WINCHESTER FIRE DEPARTMENT" or heading "EMS Student Portal" is rendered
- **THEN** it uses the EB Garamond serif font family

#### Scenario: Sans-serif UI text
- **WHEN** form labels, input fields, buttons, or links are rendered
- **THEN** they use the Roboto Condensed sans-serif font family

