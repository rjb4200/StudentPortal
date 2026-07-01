## Context

The main Admin Command Center at `src/app/admin/page.tsx` owns the admin title, hamburger menu, and primary tab navigation. The tab state is currently local React state, so the four primary sections are not addressable from other admin pages.

Several admin subpages are separate routes and therefore repeat a simple "Back to Admin Command Center" link instead of showing the normal admin navigation. This appears in pages such as `/admin/setup`, `/admin/system`, `/admin/accounts`, and `/admin/students/[id]`. The result is a split admin experience: the main admin page has full navigation, while subpages have only a backlink.

## Goals / Non-Goals

**Goals:**

- Present the Admin Command Center title, hamburger menu, and primary section navigation consistently across admin pages.
- Replace redundant back links with shared navigation where the navigation provides the same path.
- Make the primary admin sections addressable from subpages by URL so clicking a section can land on the correct Admin Command Center tab.
- Preserve existing page-specific controls and layouts below the shared navigation.
- Preserve print-friendly behavior for printable pages, especially student profile packets.

**Non-Goals:**

- Redesign the global application header.
- Convert each Admin Command Center tab into a separate route.
- Change admin authorization rules, middleware, Supabase policies, or data fetching behavior.
- Redesign the visual style of the admin pages beyond navigation consistency.

## Decisions

### Use a shared admin navigation component

Create a reusable admin navigation surface that contains the Admin Command Center title, hamburger menu, and primary section navigation. Use it from the main `/admin` page and admin subpages instead of duplicating markup.

Alternative considered: add a Next.js `src/app/admin/layout.tsx`. A layout would naturally wrap all admin routes, but the current pages mix client and server components, and the student profile page has print-specific layout needs. A component is the lower-risk first step because each page can opt in explicitly and control print visibility.

### Keep tabs on `/admin`, but make tab selection URL-aware

Retain the current in-page tab model for `/admin`, but allow the selected tab to initialize from a query string such as `?tab=daily`, `?tab=registry`, `?tab=analytics`, or `?tab=maintenance`. The shared navigation can then link to these URLs from any admin subpage.

Alternative considered: convert each tab to a separate route, for example `/admin/daily` and `/admin/maintenance`. That would make navigation more semantic, but it is larger than needed and would require more routing and state migration.

### Keep secondary admin pages in the hamburger menu

The primary navigation remains focused on operational sections: Daily Operations, Registry, Preceptor Analytics, and Maintenance & Archive. Secondary admin pages such as Onboarding Setup, Account Management, System Health, and Dev Nav remain in the hamburger menu.

Alternative considered: promote every admin page into the primary tab row. That would make the nav busy and blur the difference between core operational sections and utility/configuration pages.

### Hide shared admin navigation for print where necessary

Printable admin pages should not print the shared navigation. The student profile page already uses `print:hidden` for its top controls; the shared navigation should follow that behavior when rendered there.

## Risks / Trade-offs

- Query-string tab state can drift from local state if not synchronized carefully -> Initialize and update tab state from known tab values only, falling back to Daily Operations for invalid values.
- Shared navigation could take vertical space on dense subpages -> Keep the component compact and reuse the existing visual language.
- Server admin pages cannot use client-only navigation state directly -> Keep client-only behavior inside the shared component or keep the component usable from server pages by isolating interactive menu behavior in a client component.
- Removing back links may reduce obvious escape routes on deeply nested pages -> Ensure the Admin Command Center title and primary nav are visible and link back to `/admin`.

## Migration Plan

1. Introduce shared navigation without changing data behavior.
2. Update `/admin` to use the shared navigation and support URL-driven tab selection.
3. Replace subpage back links with the shared navigation while preserving page-specific actions.
4. Verify desktop, mobile, and print behavior.

Rollback is straightforward: restore the page-local header markup and one-off back links if shared navigation causes layout issues.

## Open Questions

- Should clicking the `Admin Command Center` title always navigate to `/admin?tab=daily`, or should it navigate to plain `/admin` and let the default tab apply?
- Should the active primary section be visually highlighted on subpages, or only on `/admin` where a section is actually active?
