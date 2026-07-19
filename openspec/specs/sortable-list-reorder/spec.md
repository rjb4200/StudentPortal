# sortable-list-reorder Specification

## Purpose
Shared `useSortableList` hook and `ReorderButtons` component that provide consistent ▲/▼ reorder UX across all admin config panels with a recalculation algorithm that guarantees unique sort_order values.

## Requirements
### Requirement: Shared sortable list reorder hook
The system SHALL provide a `useSortableList` hook that loads items ordered by `sort_order`, supports local moving items up and down via recalculation, provides the next available sort_order value, and explicitly saves or discards pending reorder changes. The hook SHALL accept a `tableName` and optional `filter` (column + value for scoped lists). When an administrator saves a pending reorder, ALL items SHALL be reassigned sort_order values as clean multiples of 10 in a single batch to guarantee uniqueness.

#### Scenario: Move item up locally
- **WHEN** `moveItem(item, -1)` is called during a reorder session
- **THEN** the item swaps position with the item above it in the displayed sorted array
- **AND** no persisted sort_order values are changed until the administrator saves the pending order

#### Scenario: Move item down locally
- **WHEN** `moveItem(item, 1)` is called during a reorder session
- **THEN** the item swaps position with the item below it in the displayed sorted array
- **AND** no persisted sort_order values are changed until the administrator saves the pending order

#### Scenario: Save reordered list
- **WHEN** an administrator saves a pending reorder
- **THEN** all items are reassigned sort_order values as `(index + 1) * 10` in ascending displayed order

#### Scenario: Discard reordered list
- **WHEN** an administrator discards a pending reorder
- **THEN** the displayed list returns to the last persisted sort order

#### Scenario: Cannot move first item up
- **WHEN** `canMoveUp(item)` is called for the item with the lowest sort_order
- **THEN** it returns `false`

#### Scenario: Cannot move last item down
- **WHEN** `canMoveDown(item)` is called for the item with the highest sort_order
- **THEN** it returns `false`

#### Scenario: Next sort order for new item
- **WHEN** `nextSortOrder()` is called
- **THEN** it returns the maximum existing sort_order value plus 10

#### Scenario: Scoped list filtering
- **WHEN** `useSortableList` is called with `filter: { column: 'rule_id', value: 'abc' }`
- **THEN** items are loaded with `.eq('rule_id', 'abc')` and ordered by sort_order within that scope

### Requirement: Reorder buttons component
The system SHALL provide a `ReorderButtons` component that renders ▲ and ▼ buttons for moving items within a sortable list. Each button SHALL be independently disabled based on position. The component SHALL accept `onMoveUp`, `onMoveDown`, `canMoveUp`, and `canMoveDown` props.

#### Scenario: Both buttons enabled for middle item
- **WHEN** `ReorderButtons` is rendered for an item that is neither first nor last
- **THEN** both ▲ and ▼ buttons are enabled

#### Scenario: Up button disabled for first item
- **WHEN** `ReorderButtons` is rendered for the first item in the list
- **THEN** the ▲ button is disabled and the ▼ button is enabled

#### Scenario: Down button disabled for last item
- **WHEN** `ReorderButtons` is rendered for the last item in the list
- **THEN** the ▼ button is disabled and the ▲ button is enabled
