export interface SortableListItem {
  id: string;
  sort_order: number;
}

export function reorderSortableItems<T extends SortableListItem>(items: T[], itemId: string, direction: -1 | 1): T[] {
  const current = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const index = current.findIndex((item) => item.id === itemId);
  const nextIndex = index + direction;
  if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return items;
  [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
  return current.map((item, itemIndex) => ({ ...item, sort_order: (itemIndex + 1) * 10 }));
}

export function hasSortableOrderChanged<T extends SortableListItem>(items: T[], persistedItems: T[]): boolean {
  return items.map((item) => item.id).join(',') !== persistedItems.map((item) => item.id).join(',');
}
