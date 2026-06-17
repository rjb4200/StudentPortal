## Context

The `/reset-password` page (63 lines, `src/app/reset-password/page.tsx`) is a minimal form with a "Set New Password" heading, two password inputs, a bare `<p>` error line, and a submit button. The success state shows a checkmark with a text link. The page reuses the global layout header which already carries the WFD logo to the left of "Winchester Fire Department — Division of EMS — Student Portal."

The page is accessed via a Supabase password reset link (URL hash contains `access_token`, `refresh_token`, `type=recovery`). Supabase automatically picks up these hash params and establishes a session. The page calls `supabase.auth.updateUser({ password })` to set the new password.

The login page (`src/app/login/page.tsx`, 276 lines) sets the visual standard with a polished white card, branded heading, student/admin toggle, and colored alert boxes using the WFD palette (`wfd-crimson`, `wfd-sage`, `wfd-gold`). Buttons use `src/components/ui/button.tsx` which supports `primary`, `secondary`, `danger`, and `sage` variants.

## Goals / Non-Goals

**Goals:**
- Add WFD logo inside the reset card for brand consistency with email templates
- Add advisory password tips (8+ chars, uppercase, number) with live checkmark feedback
- Add show/hide toggle per password field
- Detect expired/invalid reset links on mount and show a dedicated guidance card
- Style error and success messages as colored alert boxes matching the login page
- Ensure Return to Login is reachable from every state

**Non-Goals:**
- Enforcing password strength rules (advisory only)
- Extending the shared `Input` UI component (toggles are local to this page)
- Changing the Supabase auth flow or backend behavior
- Adding server-side validation (client-side only)
- Adding the WFD crimson bar INSIDE the card (the layout header already provides it; the card gets the logo + title but not a redundant crimson banner)

## Decisions

### 1. Advisory password tips, not enforced rules

**Decision**: Show three password strength criteria (8+ chars, uppercase, number) as a tips panel with live checkmark/gray feedback. Do NOT disable the submit button based on these criteria. Only enforce the 6-character minimum (Supabase's actual requirement) and password match.

**Alternatives considered**:
- *Hard enforcement*: Would create a mismatch with Supabase's 6-char minimum. A user could set a 7-char password elsewhere and not be able to match it here.
- *No guidance at all*: Misses the issue's explicit request for password requirement guidance.

**Rationale**: Advisory tips educate without blocking. The panel is labeled "Password Tips" (not "Requirements") to make the intent clear. Live checkmarks give positive feedback as the user types a stronger password, encouraging better choices without forcing them.

### 2. Inline show/hide toggle, not Input component extension

**Decision**: Implement show/hide as local state (`showPassword`, `showConfirm`) with a positioned `<button>` inside a wrapper `<div>` around each `<input>`. Do not extend the shared `Input` component.

**Alternatives considered**:
- *Extend Input with `rightIcon` prop*: Reusable but touches shared UI infrastructure used by ~20+ other pages. Risk of unintended visual breaks.
- *Create a `PasswordInput` component in `src/components/ui/`*: More reusable but premature — only this page and the dashboard first-login flow use password fields.

**Rationale**: The scoped approach minimizes blast radius. If password fields with toggles become a recurring pattern across the app, extracting a shared component can be a fast-follow refactor.

### 3. Expired link detection via `getSession()` on mount

**Decision**: On page mount, call `supabase.auth.getSession()`. If `session` is null, the reset token is expired, already used, or never received — display the expired-link card. If a session exists, show the password form.

**Rationale**: This is the canonical Supabase approach. The hash params must establish a session before `updateUser` can be called. No session = no valid token. Simple and reliable.

### 4. Five-state page model

The page has five distinct UI states driven by a single `pageState` variable (`'loading' | 'form' | 'success' | 'expired'` — with errors shown as inline alerts within the form state):

```
Mount → getSession() → null → 'expired'
                      → session → 'form'
                                    │
                          submit → error → stay 'form' with alert
                                  │
                                  success → 'success'
```

The loading state is transitional (while `getSession()` resolves) and shows nothing or a spinner. It resolves to either `form` or `expired`.

**Rationale**: A state machine model keeps the JSX clean — each state is a conditional block rather than a tangle of boolean flags.

### 5. Error/success alert styling matches login page

**Decision**: Use the same Tailwind classes as the login page's message box (lines 252-260 in `login/page.tsx`):
- Error: `bg-wfd-crimson/10 text-wfd-crimson border border-wfd-crimson/30`
- Success: `bg-wfd-sage/10 text-wfd-sage border border-wfd-sage/30`

**Rationale**: Visual consistency across auth pages. Users who see the login page's styled errors will see the same pattern on the reset page.

### 6. "Request New Link" navigates to `/login`

**Decision**: The "Request New Link" button in the expired-link state navigates to `/login`. The login page already has a "Forgot password?" flow that sends a new reset email. No need to duplicate that logic on the reset page.

**Rationale**: Keeps the forgot-password flow DRY. The login page handles email input and reset request. The reset page only handles password update.

## Risks / Trade-offs

- **[Risk] Password tips panel could confuse users who use password managers** — they might not see the tips as they autofill. **Mitigation**: Tips are advisory only; the submit button works regardless of tip satisfaction. Password managers remain fully supported.
- **[Risk] Expired link detection false positive on slow mount** — if `getSession()` hasn't resolved yet, the page might briefly flash the expired state. **Mitigation**: Use a `loading` state that shows nothing (or a subtle spinner) while `getSession()` is in flight. Only transition to `expired` after the Promise resolves with null.
- **[Risk] Show/hide toggle might be inaccessible** — screen readers need to know the state. **Mitigation**: Use `aria-label="Show password"` / `aria-label="Hide password"` on the toggle button.

## Open Questions

- Should the password tips panel be collapsible (show/hide the tips section)? Leaving it always visible for now — can revisit if user feedback says it's too prominent.
