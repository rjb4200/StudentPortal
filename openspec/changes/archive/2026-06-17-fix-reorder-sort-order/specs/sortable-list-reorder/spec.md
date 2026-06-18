## ADDED Requirements

### Requirement: Shared sortable list reorder hook
The system SHALL provide a `useSortableList` hook that loads items ordered by `sort_order`, supports moving items up/down via recalculation, and provides the next available sort_order value. The hook SHALL accept a `tableName` and optional `filter` (column + value for scoped lists). After each move, ALL items SHALL be reassigned sort_order values as clean multiples of 10 in a single batch to guarantee uniqueness.

#### Scenario: Move item up
- **WHEN** `moveItem(item, -1)` is called
- **THEN** the item swaps position with the item above it in the sorted array
- **AND** all items' sort_order values are reassigned to `(index + 1) * 10` in ascending order

#### Scenario: Move item down
- **WHEN** `moveItem(item, 1)` is called
- **THEN** the item swaps position with the item below it in the sorted array
- **AND** all items' sort_order values are reassigned to `(index + 1) * 10` in ascending order

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
