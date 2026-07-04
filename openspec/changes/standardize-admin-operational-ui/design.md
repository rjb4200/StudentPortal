## Context

The portal already contains a small UI layer in `src/components/ui/` (`Button`, `Card`, `Input`, `Badge`, `Modal`, and `Disclosure`). The admin student profile at `/admin/students/[id]` has the strongest existing visual pattern: a left-accent summary card, compact labeled fact cells, status badges, progressive disclosure sections, dense tables, and calm gray surfaces.

Issue #50 asks for reusable design-system components and broader replacement of one-off UI blocks. The implementation should use the student profile as the source pattern for admin operational screens, rather than importing a separate visual language or redesigning every page at once.

## Goals / Non-Goals

**Goals:**

- Extract reusable operational UI components that preserve the student profile record style.
- Make primary admin screens feel like one coherent operational system.
- Standardize common UI states: alerts, loading, empty states, status banners, tabs, data tables, confirmation dialogs, forms, section cards, and fact grids.
- Improve keyboard focus, ARIA semantics, color contrast, and destructive-action confirmation UX.
- Allow selected student-facing areas to reuse neutral utility components without making student pages feel like admin dossiers.

**Non-Goals:**

- No database, API, Supabase, or RLS changes.
- No new component library dependency.
- No full visual redesign of public onboarding or student dashboard flows.
- No requirement to replace every one-off class in the whole app in one pass.
- No change to business behavior for approvals, scheduling, account updates, purge workflows, or health checks.

## Decisions

### Decision: Build on the existing `src/components/ui/` layer

Add new components beside the existing primitives and update existing primitives only where needed for consistency. This avoids creating a parallel design system and keeps imports predictable.

Alternatives considered:
- Add a separate `src/components/design-system/` package: clearer naming, but creates duplicate primitives and migration churn.
- Adopt a third-party UI kit: faster primitives, but conflicts with the existing Tailwind-only stack and WFD-specific visual language.

### Decision: Treat the student profile as the source pattern

The reusable components should encode the student profile's operational style: left accents, compact labeled facts, profile-style tables, rounded gray insets, subtle borders, and status badges.

Alternatives considered:
- Use the public WFD site as the direct source for all screens: good for brand, but too marketing-oriented for admin workflows.
- Use the newer student dashboard command panel as the source: visually strong, but heavier and less suitable for dense admin records.

### Decision: Admin-first, student-selective reuse

Full dossier-style components should primarily migrate admin screens. Student screens should reuse utility components such as `Alert`, `EmptyState`, `LoadingState`, and simple `SectionCard` where they fit naturally.

Alternatives considered:
- Apply the same full pattern everywhere: maximizes consistency, but risks making student onboarding and dashboard screens feel overly administrative.
- Keep student and admin UI fully separate: reduces visual bleed, but misses low-risk reuse opportunities.

### Decision: Minimal, composable components

Prefer small components that accept `children`, variants, and `className` over large page-specific abstractions. The expected component set is:

- `PageHeader`
- `SectionCard`
- `StatusBanner`
- `Alert`
- `EmptyState`
- `LoadingState`
- `ConfirmDialog`
- `Tabs`
- `DataTable`
- `FormField`
- `FactGrid` and `FactItem`

Alternatives considered:
- Build large screen templates: faster migration for a few pages, but brittle and less reusable.
- Only update Tailwind classes inline: low initial cost, but does not solve issue #50's reuse problem.

### Decision: Migrate representative admin screens first

Start with `System Health`, then `Daily Ops`, then `Registry Management`, `Account Management`, and `Maintenance & Archive`. Refactor the student profile lightly only when needed to prove the shared components preserve the existing look.

Alternatives considered:
- Refactor all admin screens at once: maximizes consistency, but increases regression risk.
- Only create components without migrations: lower risk, but does not satisfy acceptance criteria that major screens use shared components.

## Risks / Trade-offs

- Broad visual refactor risk -> Migrate screen-by-screen and preserve existing business logic.
- Component over-abstraction -> Keep components small and allow `children` composition.
- Student profile regression -> Use it as a visual baseline and avoid changing its behavior during extraction.
- Confirmation dialog accessibility gaps -> Implement keyboard focus, escape/overlay behavior, dialog labelling, and non-browser destructive confirmation copy.
- Tailwind class drift remains in long-tail screens -> Treat major admin screens as the acceptance target and leave remaining cleanup for follow-up work.

## Migration Plan

1. Add shared operational UI components in `src/components/ui/` and export them from `src/components/ui/index.ts`.
2. Align existing primitives only where necessary for consistent focus, border, radius, and disabled states.
3. Refactor the student profile minimally to validate `FactGrid`, `SectionCard`, `DataTable`, and `Alert` without changing page behavior.
4. Refactor `System Health` as the first full admin migration because it is mostly display-oriented.
5. Refactor `Daily Ops` action queues, roster table, message panels, alerts, and destructive confirmations.
6. Refactor `Registry Management`, `Account Management`, and `Maintenance & Archive` forms/tables/cards where the shared components fit cleanly.
7. Apply neutral utility components to selected student dashboard states only if doing so does not change the student-facing visual hierarchy.
8. Verify with `npm run build` and run `npm run test` if touched behavior has existing tests.

Rollback is file-level: because no database/API changes are planned, individual screen refactors can be reverted independently if a visual or interaction regression is found.

## Open Questions

- Should the existing `Disclosure` component be renamed or extended into `RecordDisclosure`, or should `Disclosure` remain generic with new style variants?
- Should `ConfirmDialog` support typed confirmation in this change, or should typed confirmation remain custom only in high-risk purge/delete workflows?
- How much of Account Management should be converted in the first implementation pass versus left for a follow-up cleanup?
