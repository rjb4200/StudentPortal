## 1. Component Foundation

- [x] 1.1 Audit existing `src/components/ui` exports and identify overlapping class patterns from the student profile before adding new primitives.
- [x] 1.2 Add shared operational UI components for `PageHeader`, `SectionCard`, `StatusBanner`, `Alert`, `EmptyState`, and `LoadingState`.
- [x] 1.3 Add `FactGrid` and `FactItem` components that match the student profile summary-cell pattern.
- [x] 1.4 Add `DataTable` components or helpers for compact admin tables with profile-style headers, row spacing, badges, and responsive overflow.
- [x] 1.5 Add `Tabs` and `FormField` components for admin navigation controls and form layouts.
- [x] 1.6 Add an accessible `ConfirmDialog` component for destructive admin actions.
- [x] 1.7 Export new components from `src/components/ui/index.ts` and keep existing imports working.

## 2. Baseline Profile Validation

- [x] 2.1 Refactor the student profile summary card to use shared `SectionCard` and `FactGrid` components without changing displayed data or layout intent.
- [x] 2.2 Refactor student profile warning, empty, and table states to use shared components where practical.
- [ ] 2.3 Verify student profile disclosures, filters, print behavior, copy actions, and legal document modal behavior remain unchanged.

## 3. System Health Migration

- [x] 3.1 Refactor `/admin/system` page title and refresh action to use `PageHeader`.
- [x] 3.2 Refactor overall status and summary metrics to use `StatusBanner`, `SectionCard`, and `FactGrid`.
- [x] 3.3 Refactor operational alerts, check cards, storage/environment sections, and recent lists to shared alert, section, empty-state, and list/table patterns.
- [x] 3.4 Verify System Health still hides secret values and preserves refresh/error behavior.

## 4. Daily Ops Migration

- [x] 4.1 Refactor Action Required to shared section, alert, badge, empty-state, and action-row patterns while preserving existing ordering and API behavior.
- [x] 4.2 Refactor Student Messages into shared operational section/card styling without changing thread loading or message sending behavior.
- [x] 4.3 Refactor Student Roster to use the shared compact `DataTable` pattern.
- [ ] 4.4 Replace migrated Daily Ops destructive native confirmations with `ConfirmDialog` where behavior is currently covered by this change.
- [ ] 4.5 Verify approvals, registry actions, schedule actions, quiz flag acknowledgment, no-show updates, and blacklist toggles still behave as before.

## 5. Registry, Accounts, And Maintenance Migration

- [ ] 5.1 Refactor Registry Management create forms and registry lists to shared section, form-field, alert, empty, badge, and table/card patterns.
- [ ] 5.2 Refactor Account Management tabs, lists, edit forms, loading/message states, and destructive confirmations to shared operational components.
- [ ] 5.3 Refactor Maintenance & Archive export, purge, abandoned-registration, calendar-feed, and audit sections to shared operational components where practical.
- [ ] 5.4 Preserve typed confirmation behavior for purge/delete workflows when stronger confirmation is already required.

## 6. Selective Student Utility Reuse

- [ ] 6.1 Identify low-risk student dashboard empty, loading, and alert states that can use shared neutral utility components.
- [ ] 6.2 Apply shared utilities only where they do not change the student dashboard command hierarchy or make the page feel admin-oriented.
- [ ] 6.3 Verify student dashboard scheduling, messages, feed copy, and pending/certified states remain functionally unchanged.

## 7. Accessibility And Verification

- [ ] 7.1 Check keyboard focus visibility and keyboard operation for new buttons, tabs, form fields, data tables, disclosures, and confirmation dialogs.
- [ ] 7.2 Check responsive layouts on mobile-width and desktop-width screens for migrated admin pages.
- [ ] 7.3 Run `npm run build`.
- [ ] 7.4 Run `npm run test` if touched behavior has existing Vitest coverage or if API-adjacent behavior changes during migration.
- [ ] 7.5 Review migrated screens for remaining obvious one-off UI blocks that should be converted within this change scope.
