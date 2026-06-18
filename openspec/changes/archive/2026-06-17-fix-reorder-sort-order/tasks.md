## 1. Migration — Clean Duplicates & Add UNIQUE Constraints

- [x] 1.1 Create migration SQL to reassign all sort_order values to clean multiples of 10 within each scope (global for registration_fields, quiz_rules, legal_documents, resource_categories; per rule_id for quiz_photos; per category_id for resource_documents)
- [x] 1.2 Add UNIQUE constraints on sort_order (scoped where appropriate) for all six tables
- [x] 1.3 Apply migration via supabase_apply_migration
- [x] 1.4 Run supabase_generate_typescript_types and replace database.types.ts

## 2. Shared Hook & Component

- [x] 2.1 Create `src/lib/hooks/use-sortable-list.ts` with `useSortableList` hook supporting load, moveItem (recalculation), canMoveUp/Down, nextSortOrder, and optional filter for scoped lists
- [x] 2.2 Create `src/components/ui/reorder-buttons.tsx` with ▲/▼ buttons, independently disabled based on position

## 3. Registration Fields Config

- [x] 3.1 Adopt `useSortableList` hook in `registration-fields-config.tsx`, replacing the inline `moveField()` function and `loadFields()` logic
- [x] 3.2 Add `ReorderButtons` to each field row, removing the existing inline ▲/▼ button JSX
- [x] 3.3 Fix new-field sort_order to use `nextSortOrder()` from hook

## 4. Quiz Config — Rules & Photos

- [x] 4.1 Adopt `useSortableList` hook for quiz rules in `quiz-config.tsx`, adding `ReorderButtons` to each rule card
- [x] 4.2 Fix new-rule sort_order to use `nextSortOrder()` from hook
- [x] 4.3 Adopt `useSortableList` hook for quiz photos (scoped to `rule_id`), adding `ReorderButtons` to each photo card
- [x] 4.4 Fix photo loading query to filter and sort scoped to selected rule
- [x] 4.5 Fix new-photo sort_order to use `nextSortOrder()` from scoped hook

## 5. Legal Documents Config

- [x] 5.1 Adopt `useSortableList` hook in `legal-docs-config.tsx`, adding `ReorderButtons` to each document row
- [x] 5.2 Fix new-document sort_order to use `nextSortOrder()` from hook

## 6. Resource Library Config — Categories & Documents

- [x] 6.1 Adopt `useSortableList` hook for resource categories in `resource-library-config.tsx`, adding `ReorderButtons`
- [x] 6.2 Fix new-category sort_order to use `nextSortOrder()` from hook
- [x] 6.3 Adopt `useSortableList` hook for resource documents (scoped to `category_id`), adding `ReorderButtons`
- [x] 6.4 Fix document loading query to filter and sort scoped to selected category
- [x] 6.5 Fix new-document sort_order to use `nextSortOrder()` from scoped hook

## 7. Registration Form — Remove Sort Bypass

- [x] 7.1 Remove the hardcoded `full_name`/`email` sort override in `registration-form.tsx` lines 40-44, relying on sort_order alone

## 8. Verification

- [x] 8.1 Run `npm run build` to verify no compilation errors
- [ ] 8.2 Manually verify reorder works in all six config panels without creating duplicate sort_order values
