## Why

The help/contact email shown on every onboarding step is hardcoded across 5 components. When the contact person changes, it requires a code change and redeployment. Making it configurable from the admin setup page lets non-developers update it instantly.

## What Changes

- **New `portal_settings` database table** with key/value storage for site-wide configuration values.
- **Help email input on `/admin/setup`** — a simple card with a text field to edit the onboarding help email, persisted to `portal_settings`.
- **Server-side setting fetch** — an API route or server component that reads `portal_settings` so the email is available at render time.
- **Help email prop drilling** — the onboarding page reads the setting and passes it as a prop to all 5 step components, replacing the hardcoded `jbrown@winchesterky.com` strings.

## Capabilities

### New Capabilities
- `portal-settings`: A key/value configuration table with admin UI for editing site-wide settings. Initial setting: `help_email`.
- `configurable-help-email`: The onboarding flow reads the help email from the database instead of hardcoding it, with a fallback default.

### Modified Capabilities
- `admin-onboarding-setup-page`: The `/admin/setup` page gains a new section for editing the portal help email.

## Impact

- **New migration** — `portal_settings` table with `key` (text PK), `value` (text), `updated_at` (timestamptz). Seed with `help_email` = `jbrown@winchesterky.com`.
- **`src/app/admin/setup/page.tsx`** — new `HelpEmailConfig` inline card section.
- **`src/app/api/settings/route.ts`** — new GET endpoint to fetch public settings (anon-accessible for onboarding).
- **`src/app/onboarding/page.tsx`** — fetch help email and pass to step components.
- **All 5 step components** — replace hardcoded email with `helpEmail` prop.
- **No breaking changes** — the default seed value matches the current hardcoded email, so behavior is identical until an admin changes it.
