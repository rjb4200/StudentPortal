## Why

The admin field reorder mechanism uses a midpoint algorithm that collapses to duplicate values after a few moves, making `ORDER BY sort_order` non-deterministic. Five of six admin config panels have no reorder buttons at all — admins must manually type sort order numbers. New items get incorrect sort_order values (count-based instead of max-based), and the disabled state on move buttons is wrong when duplicates exist.

## What Changes

- Replace the midpoint reorder algorithm in `RegistrationFieldsConfig` with a **recalculation strategy** — after each move, all items are renumbered to clean multiples of 10 in a single batch
- Extract the reorder logic into a shared **`useSortableList` hook** (`src/lib/hooks/use-sortable-list.ts`) and **`ReorderButtons`** UI component
- Add ▲/▼ reorder buttons to the five config panels that lack them: `QuizRules`, `QuizPhotos`, `LegalDocuments`, `ResourceCategories`, `ResourceDocuments`
- Fix new-item sort_order generation: use `max(sort_order) + 10` instead of `(count + 1) * 10`
- Fix disabled-button logic to use actual min/max of sorted array
- Fix `quiz_photos` and `resource_documents` loading queries to sort scoped to their parent (`rule_id`, `category_id`)
- Add `UNIQUE` constraints on `sort_order` (scoped where appropriate) after cleaning existing duplicates via migration
- Remove the hardcoded `full_name`/`email` sort bypass in `registration-form.tsx` once sort_order is reliable

## Capabilities

### New Capabilities

- `sortable-list-reorder`: Shared `useSortableList` hook and `ReorderButtons` component that provides consistent ▲/▼ reorder UX across all admin config panels. The hook uses recalculation (renumber all items to clean spacing after each move) instead of the broken midpoint algorithm.

### Modified Capabilities

- `admin-configurable-registration-fields`: Reorder uses the shared recalculation hook instead of midpoint; new fields get correct sort_order
- `admin-configurable-onboarding-quiz`: Quiz rules and photos gain ▲/▼ reorder buttons; photos sorted per-rule instead of globally
- `admin-configurable-legal-documents`: Legal documents gain ▲/▼ reorder buttons
- `admin-configurable-resource-library`: Resource categories and documents gain ▲/▼ reorder buttons; documents sorted per-category instead of globally
- `student-onboarding`: Remove hardcoded `full_name`/`email` sort bypass in registration form

## Impact

- **6 database tables**: `UNIQUE` constraints added on `sort_order` (scoped for `quiz_photos`, `resource_documents`)
- **1 migration**: Fix existing duplicates, add UNIQUE constraints
- **2 new files**: `src/lib/hooks/use-sortable-list.ts`, `src/components/ui/reorder-buttons.tsx`
- **4 config panel files**: `registration-fields-config.tsx`, `quiz-config.tsx`, `legal-docs-config.tsx`, `resource-library-config.tsx`
- **1 onboarding file**: `registration-form.tsx` — remove sort bypass
- **No API route changes**, no new dependencies
