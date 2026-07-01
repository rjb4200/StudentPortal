## Why

Admin subpages currently replace the Admin Command Center navigation with one-off "Back to Admin Command Center" links. This makes pages such as System Health, Onboarding Setup, Account Management, and student profiles feel disconnected from the admin surface and forces extra backtracking to move between core admin areas.

## What Changes

- Add a shared Admin Command Center navigation surface that appears across admin pages instead of page-specific back links.
- Keep the existing Admin Command Center title, hamburger menu, and primary navigation labels visible on admin subpages.
- Allow primary admin navigation items to return admins to the correct Admin Command Center section from any admin subpage.
- Remove redundant "Back to Admin Command Center" links where the shared navigation provides the same path.
- Preserve page-specific actions, such as refresh buttons, print controls, and edit links.
- Preserve print-friendly behavior for printable admin pages.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-command-center`: Admin navigation becomes shared across admin pages and supports selecting core Admin Command Center sections from subpages.

## Impact

- Affected UI: `/admin`, `/admin/setup`, `/admin/system`, `/admin/accounts`, `/admin/students/[id]`, and possibly `/admin/dev`.
- Affected code: admin page header/tab implementation and any shared admin navigation component or layout introduced during implementation.
- URL behavior may change for `/admin` tab selection, likely by adding a query-string state such as `?tab=daily`, `?tab=registry`, `?tab=analytics`, or `?tab=maintenance`.
- No database, Supabase schema, API contract, or dependency changes are expected.
