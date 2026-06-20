## Why

Authentication-related links currently derive from the browser or request origin, which can point users to localhost, preview deployments, stale deployment URLs, or another non-canonical host. Supabase Auth redirect settings also need a clear source of truth so password reset and account messages consistently land on valid StudentPortal routes.

## What Changes

- Define the supported public auth/account routes for login, password reset, auth callback, onboarding, and dashboard access.
- Add a canonical production app URL configuration used when constructing user-facing auth and account links.
- Replace request-origin-derived email CTA URLs with URLs built from the canonical app URL.
- Keep password reset redirects aligned with the configured app URL and Supabase Auth redirect allow-list expectations.
- Document the hosted Supabase Auth URL settings that must match the app's production URL and route patterns.
- Clarify the account approval notification behavior so the approval email, if sent, points to a valid StudentPortal login route.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication-authorization`: Auth and account flows must use documented, supported StudentPortal routes and a canonical app URL for user-facing redirect/email links.

## Impact

- Affected code: environment validation, login password reset, account/onboarding/schedule email URL generation, and authentication specs.
- Affected configuration: Vercel/environment variables and Supabase Auth URL Configuration.
- No database schema changes or new dependencies are expected.
