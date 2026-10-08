## Why

The Registry tab (`/admin?tab=registry`) opens with Status = "All statuses" and Lifecycle = "All lifecycles", so the Classes list is a mix of active, pending, rejected, suspended, archived, and expired records. Administrators almost always act on the currently active set, and the page's own headline already highlights "In progress" classes. Opening focused on Active (and In-progress classes) matches how the page is actually used, and remembering each view's filter choice avoids losing the administrator's place when they switch between Classes, Instructors, and Training Sites.

## What Changes

- Default the **Status** filter to **Active** on every view (Classes, Instructors, Training Sites).
- Default the **Classes** **Lifecycle** filter to **In progress**.
- Make the filters **per view**: each view keeps its own search, status, and lifecycle values. Switching to a view that has not been used falls back to its defaults; switching back to a previously used view restores its last-used values.
- Add a pinned **"Needs approval"** block at the top of every view (Classes, Instructors, Training Sites) that shows pending records awaiting approval regardless of the Status and Lifecycle filters, so they cannot be missed. The pinned block respects the search box, appears only when the active filter would otherwise hide pending records, and its records are excluded from the filtered list to avoid duplicates.
- Keep the **"Review pending"** quick action as a one-click way to isolate pending records.
- Suppress the stray blank `Select...` option in the filter selects so an empty selection cannot produce an empty list.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `registry-management`: the Searchable and filterable registry records requirement gains default filters (Status = Active; Classes Lifecycle = In progress) and per-view filter memory, and a new requirement pins pending records at the top of every view so they cannot be hidden by a filter.

## Impact

- `src/components/admin/registry-management.tsx`: replace the flat filter state with a per-view filter map; set defaults; stop resetting filters on view change; add a "Review pending" action; adjust the filter selects.
- `openspec/specs/registry-management/spec.md`: requirement update via delta.
- No API, database, or RLS changes.
