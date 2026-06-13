## Why

The Admin Command Center's Maintenance & Archive tab currently holds onboarding configuration (quiz rules, registration fields, legal documents, resource library) alongside unrelated operational tools (master export, data purge, iCal feed). The welcome message configuration lives in Daily Ops. This mixes setup work with daily operations, clutters the tab interface, and loads heavy config components on every admin visit. Onboarding setup is changed rarely and should live on a separate page accessible via a hamburger menu.

## What Changes

- Create a new `/admin/setup` route rendering all five onboarding configuration components (quiz rules, registration fields, legal documents, resource library, welcome message).
- Add a hamburger icon (≡) dropdown menu to the Admin Command Center header with a link to the new Onboarding Setup page.
- Remove the four onboarding config components from Maintenance & Archive, leaving only Master Export, Purge Data, and iCal Feed.
- Remove the welcome message configuration section from Daily Ops and replace it with a small read-only card showing the current welcome message preview and a link to edit it in Onboarding Setup.

## Capabilities

### New Capabilities
- `admin-onboarding-setup-page`: A dedicated route and page for managing all onboarding configuration content, accessible via a hamburger menu from the Admin Command Center.

### Modified Capabilities
*(None — this is a UI reorganization; no requirement-level behavior changes.)*

## Impact

- New file: `src/app/admin/setup/page.tsx`
- Modified: `src/app/admin/page.tsx` (hamburger dropdown)
- Modified: `src/components/admin/maintenance-archive.tsx` (remove 4 config components)
- Modified: `src/components/admin/daily-ops.tsx` (welcome message → preview card with link)
- No database changes, no new RLS policies, no new migrations.
