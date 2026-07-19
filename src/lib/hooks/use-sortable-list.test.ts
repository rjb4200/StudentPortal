import { describe, expect, it } from 'vitest';
import { hasSortableOrderChanged, reorderSortableItems } from '../sortable-list-utils';

const items = [
  { id: 'one', sort_order: 10 },
  { id: 'two', sort_order: 20 },
  { id: 'three', sort_order: 30 },
];

describe('sortable list staging', () => {
  it('stages a move locally with normalized sort orders', () => {
    expect(reorderSortableItems(items, 'two', -1)).toEqual([
      { id: 'two', sort_order: 10 },
      { id: 'one', sort_order: 20 },
      { id: 'three', sort_order: 30 },
    ]);
  });

  it('identifies a pending order and returns to persisted order when discarded', () => {
    const staged = reorderSortableItems(items, 'two', -1);
    expect(hasSortableOrderChanged(staged, items)).toBe(true);
    expect(hasSortableOrderChanged(items, items)).toBe(false);
  });

  it('preserves item scope because it only reorders the supplied list', () => {
    const scopedItems = items.slice(0, 2);
    expect(reorderSortableItems(scopedItems, 'two', -1).map((item) => item.id)).toEqual(['two', 'one']);
  });
});
