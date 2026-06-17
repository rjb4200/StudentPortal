## Why

The password reset page (`/reset-password`) is functional but bare — a minimal form with no WFD branding, no password guidance, no show/hide controls, and no handling for expired or invalid reset links. It falls short of the polished auth experience expected for the WFD EMS Student Portal and creates confusion when users land on an expired link with no clear path forward. Closes #74.

## What Changes

- Add centered WFD logo and portal branding inside the reset card
- Add password tips panel showing recommended strength criteria (8+ chars, uppercase, number) as live guidance — not enforced, advisory only
- Add show/hide password toggle (eye icon) on both password fields
- Add dedicated "Reset Link Expired" state detected when no valid Supabase session exists on mount, with Request New Link and Return to Login actions
- Upgrade error and success messages to styled alert boxes matching the login page pattern (colored background + border, using WFD palette)
- Add Return to Login link visible on all states (form, error, expired)
- Keep existing backend integration with Supabase `auth.updateUser()` unchanged

## Capabilities

### New Capabilities
- `password-reset-polish`: WFD-branded password reset page with password tips, show/hide toggles, expired link detection, styled alerts, and consistent Return to Login action

### Modified Capabilities
<!-- None — existing specs cover login-side forgot-password trigger and first-login password change, not the reset page UX -->

## Impact

- Frontend: `src/app/reset-password/page.tsx` — full rewrite (63 lines → ~180 lines)
- No API changes, no database changes, no new dependencies
- Supabase client used for `getSession()` (already available via existing `createClient`)
