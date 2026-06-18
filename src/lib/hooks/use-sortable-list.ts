'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type SortableTableName = keyof Database['public']['Tables'];

interface SortableItem {
  id: string;
  sort_order: number;
}

interface UseSortableListOptions {
  tableName: SortableTableName;
  filter?: { column: string; value: string };
}

interface UseSortableListReturn<T extends SortableItem> {
  items: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  moveItem: (item: T, direction: -1 | 1) => Promise<void>;
  canMoveUp: (item: T) => boolean;
  canMoveDown: (item: T) => boolean;
  nextSortOrder: () => number;
}

export function useSortableList<T extends SortableItem>(
  options: UseSortableListOptions
): UseSortableListReturn<T> {
  const { tableName, filter } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient() as any;
    let query = supabase.from(tableName).select('*').order('sort_order', { ascending: true });

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
    } else {
      setItems((data as unknown as T[]) ?? []);
    }

    setLoading(false);
  }, [tableName, filter?.column, filter?.value]);

  useEffect(() => {
    load();
  }, [load]);

  const moveItem = useCallback(
    async (item: T, direction: -1 | 1) => {
      const current = [...items].sort((a, b) => a.sort_order - b.sort_order);
      const idx = current.findIndex((i) => i.id === item.id);
      if (idx === -1) return;

      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= current.length) return;

      [current[idx], current[newIdx]] = [current[newIdx], current[idx]];

      const supabase = createClient() as any;
      const updates = current.map((it, i) =>
        supabase
          .from(tableName)
          .update({ sort_order: (i + 1) * 10, updated_at: new Date().toISOString() })
          .eq('id', it.id)
      );

      await Promise.all(updates);
      await load();
    },
    [items, tableName, load]
  );

  const canMoveUp = useCallback(
    (item: T): boolean => {
      const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
      return sorted.length > 1 && sorted[0]?.id !== item.id;
    },
    [items]
  );

  const canMoveDown = useCallback(
    (item: T): boolean => {
      const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
      return sorted.length > 1 && sorted[sorted.length - 1]?.id !== item.id;
    },
    [items]
  );

  const nextSortOrder = useCallback((): number => {
    const max = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
    return max + 10;
  }, [items]);

  return {
    items,
    loading,
    error,
    reload: load,
    moveItem,
    canMoveUp,
    canMoveDown,
    nextSortOrder,
  };
}
