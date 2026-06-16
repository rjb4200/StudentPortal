## ADDED Requirements

### Requirement: Login page uses branded components
The login page SHALL use the `Input` component for form fields and the `Button` component for submit actions with WFD variants. Feedback messages (success, error) SHALL use `wfd-sage` and `wfd-crimson` tinted backgrounds — not generic `bg-green-50` or `bg-red-50`.

#### Scenario: Login form uses Input and Button components
- **WHEN** the login page is rendered
- **THEN** email and password fields SHALL be rendered with the `Input` component and the sign-in button SHALL be rendered with the `Button` component

#### Scenario: Error message uses crimson tint
- **WHEN** a login error is displayed
- **THEN** the error message SHALL have a `wfd-crimson/10` background and `wfd-crimson` text
