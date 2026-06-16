## ADDED Requirements

### Requirement: WFD design tokens applied to UI components
All shared UI components (Button, Badge, Card, Input, Modal) SHALL use WFD design tokens (`wfd-crimson`, `wfd-sage`, `wfd-gold`, `wfd-charcoal`) instead of hardcoded Tailwind color utilities for all semantic colors.

#### Scenario: Primary button uses WFD crimson
- **WHEN** a primary button is rendered
- **THEN** its background SHALL be `wfd-crimson` and its hover state SHALL darken via `brightness` rather than a hardcoded hex

#### Scenario: Sage variant button is available
- **WHEN** a button with `variant="sage"` is rendered
- **THEN** its background SHALL be `wfd-sage` with white text

#### Scenario: Badge uses WFD palette
- **WHEN** a badge with any variant is rendered
- **THEN** its colors SHALL use only `wfd-crimson`, `wfd-sage`, `wfd-gold`, or `wfd-charcoal` tokens (with optional opacity modifiers) — no `yellow-500`, `green-100`, `red-100`, or `blue-100`

#### Scenario: Card has WFD hover-lift effect
- **WHEN** a card with the `hover` prop is hovered
- **THEN** the card SHALL translate upward (`-translate-y-1`) with an enhanced shadow

#### Scenario: Input error state uses WFD crimson
- **WHEN** an input has an error
- **THEN** the border SHALL be `wfd-crimson` and error text SHALL be `wfd-crimson`

### Requirement: WFD typography
The portal SHALL use Roboto Condensed as the primary sans-serif font and SHALL make EB Garamond available as a serif utility class (`font-serif`). Inter SHALL NOT be the primary font.

#### Scenario: Body text uses Roboto Condensed
- **WHEN** any page in the portal is rendered
- **THEN** the default body font SHALL be Roboto Condensed

#### Scenario: Ceremonial text uses EB Garamond
- **WHEN** an element has the `font-serif` class
- **THEN** its text SHALL render in EB Garamond

### Requirement: WFD body background
The global page background SHALL be `#f9f9f9` (light gray matching the WFD website reference).

#### Scenario: Page background is light gray
- **WHEN** any page is rendered
- **THEN** the body background SHALL be `#f9f9f9`, not white

### Requirement: Page-level colors use design tokens
All page components (dashboard, admin, login, landing, expired, blacklisted, reset-password, preceptor) and admin/dashboard sub-components SHALL NOT use hardcoded Tailwind color utilities (`amber-*`, `blue-*`, `green-*`, `red-*`, `orange-*`, `yellow-*`) for semantic coloring. Only `gray-*` SHALL be used for neutral/structural elements.

#### Scenario: Dashboard alert cards use gold and sage
- **WHEN** an alert card is rendered on the dashboard (pending approval, welcome message, password prompt)
- **THEN** the card SHALL use `wfd-gold` or `wfd-sage` tinted borders and backgrounds — not `amber-*` or `blue-*`

#### Scenario: Admin page uses charcoal-tinted grays
- **WHEN** the admin command center is rendered
- **THEN** interactive elements SHALL use `wfd-charcoal` or `wfd-crimson` for active states — not generic `gray-*` for everything

#### Scenario: Login page uses branded Input and Button components
- **WHEN** the login page is rendered
- **THEN** form fields SHALL use the `Input` component and submit buttons SHALL use the `Button` component with WFD variants
