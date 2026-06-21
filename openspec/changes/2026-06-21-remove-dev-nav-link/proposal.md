## Why

The dev navigation page exposes an internal route list and direct links to development/testing pages. It should not be visible to production users.

## What Changes

- Remove the "Dev Nav" link from the admin command center navigation menu in `src/app/admin/page.tsx`.
- The `/admin/dev` page itself remains accessible at the route level but is no longer linked from production UI.

## Capabilities

### New Capabilities
*(None — removal of development-only UI from production navigation.)*

### Modified Capabilities
- `admin-command-center`: Dev Nav link removed from the admin menu.

## Impact

- Modified: `src/app/admin/page.tsx` — removed the Dev Nav `<Link>` entry from the menu.
- No new dependencies, no database changes, no environment variable changes.
