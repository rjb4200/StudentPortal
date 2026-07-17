## Why

Admin screens currently mix one-off cards, tables, alerts, tabs, loading states, and destructive browser dialogs. The student profile page already has a stronger operational record pattern; reusing that pattern will make admin workflows feel more consistent, scannable, and production-ready.

## What Changes

- Build reusable UI components based on the student profile record style: page headers, section cards, status banners, alerts, empty/loading states, confirmation dialogs, tabs, data tables, form fields, and fact grids.
- Standardize admin operational screens around compact labeled facts, left-accent record cards, disclosure/section surfaces, profile-style tables, consistent badges, and accessible focus states.
- Migrate primary admin operational areas first: System Health, Daily Ops, Registry Management, Account Management, and Maintenance & Archive.
- Keep the full dossier-style pattern admin-first; student-facing screens may adopt shared utility components such as alerts, empty states, loading states, and simple section cards where appropriate.
- Replace selected destructive native `confirm()` flows in admin operational screens with reusable confirmation dialogs.

## Capabilities

### New Capabilities

- `operational-ui-components`: Reusable record-oriented UI components and interaction states for admin operational screens, with selective student-facing reuse.

### Modified Capabilities

- `admin-command-center`: Daily Ops uses the shared operational UI pattern for action queues, message panels, roster surfaces, tabs, alerts, tables, and destructive confirmations.
- `system-health-operations-dashboard`: System Health uses shared operational headers, status banners, fact grids, section cards, alerts, empty states, and recent activity lists.
- `admin-account-management`: Account Management uses shared operational UI components for account tabs, account lists, edit forms, alerts, loading states, and destructive confirmations.
- `admin-student-profile`: Student Profile remains the visual source pattern and should be preserved while using shared components where practical.
- `student-dashboard`: Student-facing screens may reuse neutral utility states and section cards without adopting the full admin dossier layout.

## Impact

- Affected code: `src/components/ui/`, `src/app/admin/**`, `src/components/admin/**`, selected student-facing components under `src/app/dashboard` and `src/components/dashboard`.
- APIs/data model: no database, API, or Supabase schema changes expected.
- Dependencies: no new package dependency expected; use existing React, Next.js, and Tailwind setup.
- Verification: run `npm run build`; run `npm run test` if behavior touched by existing tests changes.
