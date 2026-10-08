## Context

See `proposal.md` for motivation. Current state in `src/components/admin/registry-management.tsx`:

- A single flat set of filter states is shared across all views: `query`, `statusFilter` (default `'all'`), `lifecycleFilter` (default `'all'`).
- `changeView()` resets `query = ''`, `statusFilter = 'all'`, `lifecycleFilter = 'all'` on every tab switch.
- The Status select renders on all views; the Lifecycle select renders only for Classes.
- The page already computes `inProgressCount` as active classes whose date window includes today, and the banner's "Review expired classes" action sets `selectedView = 'classes'`, `statusFilter = 'active'`, `lifecycleFilter = 'expired'`.
- The shared `Select` component always prepends a blank `<option value="">Select...</option>`, which for a filter can set an invalid empty value.

## Goals / Non-Goals

**Goals:**
- Open each view focused on Active records (Classes additionally In progress).
- Remember each view's filter choices for the session so tab switching does not lose them.
- Guarantee pending records cannot be hidden by a filter (pinned "Needs approval" block).

**Non-Goals:**
- Persisting filter state across reloads (no URL params, no localStorage).
- Changing registry data, APIs, or the lifecycle derivation.
- Adding new filter dimensions.

## Decisions

### D1: Per-view filter buckets
**Decision:** Replace the flat `query`/`statusFilter`/`lifecycleFilter` states with a map keyed by view: `{ classes, instructors, sites }`, each holding `{ query, status, lifecycle? }`. Derive the active values from `filters[selectedView]`.

**Why:** The requirement is per-view memory; a map expresses it directly and removes the reset in `changeView`.

**Alternative considered:** Keep flat state and snapshot/restore on switch. Rejected: more error-prone than one map.

### D2: Defaults — Active everywhere, In progress for Classes
**Decision:** Initialize `status = 'active'` for all three views and `lifecycle = 'in_progress'` for Classes.

**Why:** Matches how the page is used and the existing "In progress N active classes" headline.

### D3: Session-only memory
**Decision:** Filter memory lives in component state; a reload returns to defaults.

**Why:** Matches the "swap back within the session" requirement and avoids URL/localStorage complexity.

### D4: Tab switch does not reset
**Decision:** `changeView(view)` only sets `selectedView`. Filters are updated only by the user on the current view.

**Why:** Directly produces "untouched view → default; returning view → last used."

### D5: Pin pending records at the top of every view
**Decision:** Render a "Needs approval" block at the top of every entity view listing pending records. The block ignores the Status and Lifecycle filters but respects the search query, appears only when the active filter would otherwise hide pending records, lists the longest-waiting records first, and its records are excluded from the filtered list to avoid duplication. The "Review pending" quick action remains as a one-click isolate affordance.

**Why:** Defaulting to Active (and Classes to In progress) can hide pending records — and a pending class is typically `upcoming`, so it is doubly hidden. Pinning makes "cannot be missed" filter-independent without distorting the Status filter into a combined value.

**Alternative considered:** A combined "Active & Pending" default Status (and widening the lifecycle default). Rejected: it changes the meaning of the Status filter, sacrifices the In-progress default, and still hides pending once the user changes filters.

### D6: Suppress the blank option for filters
**Decision:** The Status/Lifecycle filter selects SHALL NOT render the shared blank `Select...` option, so a user cannot select an empty value that matches nothing.

**Why:** The blank option is a form affordance, not a valid filter value.

### Non-change: the "Review expired classes" action
It already sets Active + Expired for Classes; under D1 it writes into the Classes bucket, which is consistent with per-view memory.

## Risks / Trade-offs

- [Active default hides pending records] → pinned "Needs approval" block (D5) plus the "Review pending" button; pending count also remains in the fact grid.
- [Pinned block duplicates rows already in the filtered list] → render the block only when the active filter would hide pending, and exclude pinned rows from the filtered list.
- [Pinned block is noisy while searching] → the block respects the search query.
- [A user selects the blank option and sees an empty list] → suppress the blank option (D6).
- [Per-view search surprises users who expect a global search] → the model is consistent (each view owns all three filters); documented in the requirement.
- [Reset removal leaves a stale search when switching views] → intended by design; each view keeps its own query.

## Migration Plan

UI-only change; no data migration. Rollback is reverting the component.

## Open Questions

- Whether filter state should later persist across reloads (URL params or localStorage). Deferred; not required by this change.
