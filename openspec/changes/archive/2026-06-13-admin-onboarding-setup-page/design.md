## Context

The onboarding configuration components (quiz rules, registration fields, legal documents, resource library) currently live in the Maintenance & Archive tab. The welcome message editor lives in Daily Ops. Together they form a logical "onboarding setup" grouping but are scattered across two tabs. The Maintenance & Archive tab also contains unrelated operational tools (master export, data purge, iCal feed), creating a mixed-concern tab.

These configuration components are large and heavy to render. Loading all of them on every admin page visit is unnecessary since onboarding setup is changed infrequently.

## Goals / Non-Goals

**Goals:**
- Create a new `/admin/setup` route that hosts all five onboarding config components on a single dedicated page.
- Add a hamburger icon with dropdown navigation to the Admin Command Center header.
- Replace the welcome message editor in Daily Ops with a small read-only preview card linking to the setup page.
- Remove the four onboarding config components from Maintenance & Archive, leaving only operational tools.
- Preserve the 3-tab layout (Daily Ops, Preceptor Analytics, Maintenance & Archive) unchanged.

**Non-Goals:**
- Changing the visual design or functionality of any onboarding config component.
- Adding, removing, or reordering tabs.
- Modifying middleware or auth logic.
- Adding mobile-specific navigation patterns.
- Changing the Preceptor Analytics tab in any way.

## Decisions

### 1. Separate route (`/admin/setup`) rather than inline toggle

The setup page will be a Next.js App Router route at `src/app/admin/setup/page.tsx`. The hamburger menu contains a `<Link>` to this route.

**Rationale:** Separate routes enable lazy loading, bookmarkable URLs, and browser back-button support. The 5 config components are heavy enough that loading them only when navigated to is a meaningful performance improvement. The middleware already protects all `/admin` routes, so no auth changes are needed.

**Alternative considered:** Inline toggle/drawer on the same page. This would keep all state in one component but would load heavy config components on every admin visit and add complexity to the existing page component.

### 2. Hamburger as a dropdown menu, not a tab

The hamburger icon (≡) sits in the admin page header alongside the "Admin Command Center" title. Clicking it opens a small dropdown with a single link: "Onboarding Setup". The 3 existing tabs remain unchanged.

**Rationale:** The hamburger is a navigation element, not a content tab. Onboarding setup is not a peer of Daily Ops — it's secondary navigation. A dropdown menu is a standard pattern for secondary/utility navigation.

**Alternative considered:** A 4th tab styled with a hamburger icon. This breaks tab semantics — tabs imply equal-weight content sections. The hamburger being separate from tabs reinforces that setup is different from daily operations.

### 3. Welcome message preview, not full editor, in Daily Ops

The welcome message section in Daily Ops is replaced with a small card that shows:
- Current welcome message title (or "No welcome message configured")
- Truncated body preview (first ~100 chars)
- A link: "Edit in Onboarding Setup →"

**Rationale:** The welcome message is onboarding content, not a daily ops concern. But admins should still see its current state at a glance from Daily Ops. The preview gives visibility without the editing UI.

**Alternative considered:** Remove the welcome message section entirely. This loses visibility — an admin might forget to configure it or not realize the current message is outdated.

### 4. No component refactoring

The 5 existing config components (`QuizConfig`, `RegistrationFieldsConfig`, `LegalDocsConfig`, `ResourceLibraryConfig`, and the welcome message editor from Daily Ops) are reused as-is on the new page. They are imported and rendered without internal changes.

**Rationale:** Minimizes regression risk. Each component already works independently and has no coupling to its parent tab.

## Risks / Trade-offs

- **[Risk] Welcome message preview may go stale if the message is edited elsewhere** → Mitigation: The preview fetches current data on load via the existing `loadAll` mechanism. It's not cached.
- **[Risk] Two admins editing setup simultaneously on different tabs could conflict** → Mitigation: This is the same risk as before (components were already on different tabs). Each component handles its own Supabase writes with last-write-wins semantics.
- **[Risk] Hamburger dropdown is a single-item menu, which may look odd** → Mitigation: Future secondary nav items (e.g., "System Settings", "Audit Log Viewer") can be added to the same dropdown. For now, a single item is clean and intentional.

## Migration Plan

1. Create `src/app/admin/setup/page.tsx` — imports and renders all 5 config components.
2. Update `src/app/admin/page.tsx` — add hamburger icon with dropdown state and `<Link>` to `/admin/setup`.
3. Update `src/components/admin/maintenance-archive.tsx` — remove imports and rendering of QuizConfig, RegistrationFieldsConfig, LegalDocsConfig, ResourceLibraryConfig, and the "Onboarding Configuration" heading.
4. Update `src/components/admin/daily-ops.tsx` — remove welcome message state/handlers/JSX, add welcome preview card with link.
5. Run `npm run build` to verify.

Rollback: All changes are UI-only with no database impact. Revert the 4 files and redeploy.

## Open Questions

- Should the setup page have a "Back to Admin" link or breadcrumb?
- Should the hamburger icon be visible on the `/admin/setup` page itself, or only on the main admin page?
