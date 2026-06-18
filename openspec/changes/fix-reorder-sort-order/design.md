## Context

Six tables use `sort_order` (integer, default 0) for admin-controlled ordering. Only `registration_fields` has ▲/▼ reorder buttons — using a midpoint algorithm that collapses to duplicates. The other five tables require admins to manually type numbers. New items get `(count+1)*10` regardless of existing sort_order values. No UNIQUE constraints exist, allowing silent duplicates that make `ORDER BY sort_order` non-deterministic. The registration form works around sort_order unreliability with a hardcoded `full_name`/`email` sort bypass.

## Goals / Non-Goals

**Goals:**
- Replace the broken midpoint reorder algorithm with recalculation (renumber all items to clean multiples of 10 after each move)
- Extract shared `useSortableList` hook and `ReorderButtons` component
- Add ▲/▼ reorder buttons to all six config panels
- Fix new-item sort_order to use max-based calculation
- Fix scoped sorting for `quiz_photos` (per `rule_id`) and `resource_documents` (per `category_id`)
- Add UNIQUE constraints on `sort_order` after cleaning existing duplicates
- Remove the registration form's hardcoded sort bypass

**Non-Goals:**
- Drag-and-drop reordering (out of scope — ▲/▼ is simpler and sufficient)
- Batch reorder API endpoint (each panel already reloads after mutation)
- Real-time collaboration on admin config (single-admin use case)

## Decisions

### Decision 1: Recalculation over midpoint

```
Midpoint (current, broken):
  Move item up → newOrder = round((left + right) / 2)
  After ~5 moves in same gap → integer collision → duplicate

Recalculation (new):
  Move item up → swap positions in sorted array
  Reassign all items: sort_order = (index + 1) * 10
  Batch update via Promise.all on upsert operations
```

Spacing of 10 allows 9 future inserts between any two items before another recalc is needed. Recalculation on every move guarantees clean spacing and uniqueness.

**Alternative considered:** Fractional positioning (e.g., using floats or strings like "aaaa", "aaab"). More complex, harder to debug, and the recalc approach is simpler given small item counts (typically <20 per panel).

### Decision 2: Hook-based architecture, not a full generic component

A `<SortableList>` component would need a dozen render props to handle the divergent list-item JSX across the four panels (row cards, thumbnail cards, selectable buttons, tab pills). Better to extract the data/logic layer into a hook and provide a lightweight `ReorderButtons` UI component that each panel drops into its existing render.

```ts
// Hook API
function useSortableList<T extends { id: string; sort_order: number }>(options: {
  tableName: string;
  filter?: { column: string; value: string };
}) {
  return {
    items: T[],
    loading: boolean,
    error: string | null,
    reload: () => Promise<void>,
    moveItem: (item: T, direction: -1 | 1) => Promise<void>,
    canMoveUp: (item: T) => boolean,
    canMoveDown: (item: T) => boolean,
    nextSortOrder: () => number,
  };
}

// UI component
<ReorderButtons
  onMoveUp={() => moveItem(item, -1)}
  onMoveDown={() => moveItem(item, 1)}
  canMoveUp={canMoveUp(item)}
  canMoveDown={canMoveDown(item)}
/>
```

### Decision 3: `nextSortOrder()` uses max + 10

```ts
const nextSortOrder = (): number => {
  const max = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
  return max + 10;
};
```

This ensures new items always land at the end, even if existing items have been reordered.

### Decision 4: UNIQUE constraints scoped where appropriate

| Table | Constraint |
|-------|-----------|
| `registration_fields` | `UNIQUE (sort_order)` |
| `quiz_rules` | `UNIQUE (sort_order)` |
| `quiz_photos` | `UNIQUE (rule_id, sort_order)` |
| `legal_documents` | `UNIQUE (sort_order)` |
| `resource_categories` | `UNIQUE (sort_order)` |
| `resource_documents` | `UNIQUE (category_id, sort_order)` |

Before adding constraints, a migration cleans existing duplicates by reassigning sort_order to clean multiples of 10 within each scope.

### Decision 5: Remove registration form hardcoded bypass

`registration-form.tsx` line 40-44 sorts `full_name` and `email` to the top regardless of sort_order. Once UNIQUE constraints guarantee reliable ordering, this bypass is no longer needed. The seed data already has `full_name` at sort_order 10 and `email` at sort_order 20, so removing the bypass keeps them at the top naturally.

## Risks / Trade-offs

- **Batch update on every move**: Reassigns sort_order for all items on each ▲/▼ click. For <20 items, this is a single round-trip with Promise.all — negligible overhead. → Mitigation: If item counts grow beyond 100, we could debounce or reassign only neighbors. Not needed yet.
- **UNIQUE constraint blocks manual number editing**: Admins can no longer type arbitrary sort_order numbers if they conflict. → Mitigation: The recalculation hook ensures uniqueness. Manual sort_order input fields in edit forms can remain but will surface uniqueness errors from the DB — admins should use ▲/▼ instead.
- **Migration modifies live data**: The cleanup migration reassigns sort_order values. → Mitigation: The migration runs in a transaction. If it fails, the old values are preserved. No data loss — only reordering.
- **Scoped sort for quiz_photos changes data model**: The loading query adds `.eq('rule_id', ...)` — this is correct behavior but could reveal existing data issues where photos from different rules share sort_order values. → Mitigation: Migration cleans these up first.

## Open Questions

- Should the manual sort_order number input be removed from edit forms entirely once ▲/▼ buttons are available? Leaning toward keeping it for bulk edits but relying on the constraint for enforcement.
