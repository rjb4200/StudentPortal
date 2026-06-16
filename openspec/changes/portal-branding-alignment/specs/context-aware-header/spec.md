## ADDED Requirements

### Requirement: Crimson header on public pages
The global layout header SHALL use a crimson (`#A40104`) background on public-facing pages: `/`, `/onboarding`, `/login`, `/expired`, `/blacklisted`, `/reset-password`. The department name SHALL render in white text with text-shadow for contrast. The subtitle SHALL render in gold italic text.

#### Scenario: Landing page shows crimson header
- **WHEN** a user navigates to `/`
- **THEN** the header background SHALL be `wfd-crimson`, the department name SHALL be `text-white`, and the subtitle SHALL be `text-wfd-gold italic`

#### Scenario: Onboarding shows crimson header
- **WHEN** a student navigates to `/onboarding`
- **THEN** the header background SHALL be `wfd-crimson`

#### Scenario: Login page shows crimson header
- **WHEN** a user navigates to `/login`
- **THEN** the header background SHALL be `wfd-crimson`

### Requirement: Charcoal header on authenticated pages
The global layout header SHALL use a charcoal (`#1C1C1E`) background on authenticated pages: `/dashboard`, `/admin`, `/admin/setup`, `/admin/accounts`, `/admin/dev`, `/preceptor`. The department name SHALL render in crimson text as it currently does.

#### Scenario: Dashboard shows charcoal header
- **WHEN** a student navigates to `/dashboard`
- **THEN** the header background SHALL be `wfd-charcoal` and the department name SHALL be `text-wfd-crimson`

#### Scenario: Admin pages show charcoal header
- **WHEN** an admin navigates to `/admin` or any `/admin/*` sub-route
- **THEN** the header background SHALL be `wfd-charcoal`
