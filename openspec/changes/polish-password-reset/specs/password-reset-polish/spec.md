## ADDED Requirements

### Requirement: WFD-branded password reset card
The `/reset-password` page SHALL display a white card containing a centered WFD logo above the heading "Reset Your Password" with subtitle text "Choose a new password for your EMS Student Portal account." The card SHALL use the existing `bg-white rounded-lg shadow-lg border border-gray-200 p-8` styling pattern from the login page.

#### Scenario: Page loads with valid reset token
- **WHEN** a user navigates to `/reset-password` with a valid Supabase recovery token in the URL hash
- **THEN** a card displays the WFD logo, heading, subtitle, and password form

### Requirement: Password tips panel
The password reset form SHALL display a password tips panel below the subtitle showing three advisory criteria: "At least 8 characters", "Include an uppercase letter", and "Include a number". Each criterion SHALL show a green checkmark when the typed password satisfies it and a gray indicator otherwise. The criteria SHALL be advisory only — the submit button SHALL NOT be disabled based on these criteria.

#### Scenario: Password meets all three criteria
- **WHEN** a user types a password that is 8+ characters long with an uppercase letter and a number
- **THEN** all three criteria display green checkmarks

#### Scenario: Password meets only some criteria
- **WHEN** a user types a password that is 8 characters long but has no uppercase or number
- **THEN** the length criterion shows a green checkmark and the other two show gray indicators

#### Scenario: Password criteria do not block submission
- **WHEN** a user types a password shorter than 8 characters with no uppercase or number
- **THEN** the Update Password button remains enabled (only the base validation of matching + 6-char minimum blocks submission)

### Requirement: Show/hide password toggles
Each password input field SHALL include a toggle button that switches the input type between `password` and `text`. The toggle SHALL use a recognizable icon or text label (e.g., "Show" / "Hide"). Each field's toggle SHALL operate independently.

#### Scenario: Toggle password visibility on
- **WHEN** a user clicks the show/hide toggle on the New Password field while `type="password"`
- **THEN** the input type changes to `text` and the password is visible in plain text

#### Scenario: Toggle password visibility off
- **WHEN** a user clicks the show/hide toggle on the New Password field while `type="text"`
- **THEN** the input type changes to `password` and the password is masked

#### Scenario: Toggles operate independently
- **WHEN** a user shows the New Password field and the Confirm Password field is still masked
- **THEN** only the New Password field displays in plain text; the Confirm field remains masked

### Requirement: Expired or invalid reset link state
The page SHALL detect whether a valid Supabase recovery session exists on mount via `supabase.auth.getSession()`. If no session exists, the page SHALL display an expired-link card with a warning icon, the message "Reset Link Expired or Invalid", an explanation that links are single-use and expire after 1 hour, and two action buttons: "Request New Link" (redirects to `/login`) and "Return to Login".

#### Scenario: Valid recovery session exists
- **WHEN** the page mounts and `getSession()` returns a valid session
- **THEN** the password reset form is displayed

#### Scenario: No recovery session exists
- **WHEN** the page mounts and `getSession()` returns no session
- **THEN** an expired-link card is displayed with Request New Link and Return to Login buttons

#### Scenario: Expired link offers both actions
- **WHEN** the expired-link state is displayed
- **THEN** both a "Request New Link" button and a "Return to Login" link are visible

### Requirement: Styled alert messages
Error and success messages SHALL be rendered as styled alert boxes matching the login page message pattern: colored background with matching border. Errors SHALL use `bg-wfd-crimson/10 text-wfd-crimson border border-wfd-crimson/30`. Success messages SHALL use `bg-wfd-sage/10 text-wfd-sage border border-wfd-sage/30`. Validation errors (password mismatch, too short) SHALL use the error styling.

#### Scenario: Password mismatch error
- **WHEN** a user submits the form with mismatched passwords
- **THEN** a crimson alert box displays "Passwords do not match."

#### Scenario: Password too short error
- **WHEN** a user submits the form with a password shorter than 6 characters
- **THEN** a crimson alert box displays "Password must be at least 6 characters."

#### Scenario: Supabase error displayed
- **WHEN** Supabase returns an error from `auth.updateUser()`
- **THEN** the error message is displayed in a crimson alert box

#### Scenario: Successful password update
- **WHEN** `auth.updateUser()` succeeds
- **THEN** the success state is displayed with a sage alert box and a "Return to Login" button

### Requirement: Return to Login on all states
A "Return to Login" link SHALL be visible in all states of the page: the form state (below the submit button), the error state, the success state, and the expired-link state.

#### Scenario: Return to Login on form
- **WHEN** the password reset form is displayed
- **THEN** a "Return to Login" link appears below the Update Password button

#### Scenario: Return to Login on success
- **WHEN** the success state is displayed
- **THEN** a "Return to Login" button is prominent in the success card

#### Scenario: Return to Login on expired link
- **WHEN** the expired-link state is displayed
- **THEN** a "Return to Login" link appears alongside the Request New Link button
