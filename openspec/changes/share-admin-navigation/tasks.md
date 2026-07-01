## 1. Shared Navigation Foundation

- [x] 1.1 Create a reusable admin navigation component that renders the Admin Command Center title, hamburger menu, and primary navigation entries.
- [x] 1.2 Include secondary admin destinations in the hamburger menu matching the current Admin Command Center menu.
- [x] 1.3 Support optional active-section highlighting and print hiding without requiring every page to manage menu state.

## 2. Admin Command Center Tab URLs

- [x] 2.1 Update `/admin` to initialize the active tab from a validated URL section value.
- [x] 2.2 Update primary navigation interactions on `/admin` so selected tabs and URL state remain consistent.
- [x] 2.3 Ensure invalid or missing section values fall back to Daily Operations.

## 3. Subpage Integration

- [x] 3.1 Replace the page-local header/navigation in `/admin` with the shared admin navigation component.
- [x] 3.2 Replace the redundant back link on `/admin/setup` with the shared admin navigation while preserving setup page content.
- [x] 3.3 Replace the redundant back link on `/admin/system` with the shared admin navigation while preserving the Refresh action.
- [x] 3.4 Replace the redundant back link on `/admin/accounts` with the shared admin navigation while preserving account management flows.
- [x] 3.5 Replace the redundant back link on `/admin/students/[id]` with the shared admin navigation while preserving Print Packet and Edit Student actions.
- [x] 3.6 Review `/admin/dev` and either align it with the shared admin navigation or intentionally leave it as development-only navigation.

## 4. Verification

- [x] 4.1 Verify each primary navigation entry works from `/admin/setup`, `/admin/system`, `/admin/accounts`, and `/admin/students/[id]`.
- [x] 4.2 Verify `/admin` displays the correct section for each valid section URL and falls back to Daily Operations for invalid values.
- [x] 4.3 Verify mobile layout preserves access to the primary navigation and hamburger menu.
- [x] 4.4 Verify student profile print output does not include admin navigation.
- [x] 4.5 Run `npm run build`.
