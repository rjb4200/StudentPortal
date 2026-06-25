## 1. Database and Types

- [x] 1.1 Add a Supabase migration for quiz rule question type and text-choice answer option support
- [x] 1.2 Backfill existing quiz rules as `photo_grid` and preserve existing photo option behavior
- [x] 1.3 Update `src/lib/supabase/database.types.ts` after the schema change

## 2. Admin Quiz Configuration

- [x] 2.1 Add a per-rule question type control for `photo_grid` and `text_choice`
- [x] 2.2 Update answer option forms to collect image URLs for photo-grid rules and text labels for text-choice rules
- [x] 2.3 Update active-rule validation by question type
- [x] 2.4 Update admin list labels and help copy so text-choice rules are clear to configure

## 3. Student Knowledge Gate

- [x] 3.1 Load rule question type and text-choice answer option fields from Supabase
- [x] 3.2 Keep existing photo-grid filtering and media-load blocking for photo-grid rules
- [x] 3.3 Add text-choice question rendering in the existing quiz flow
- [x] 3.4 Generalize answer scoring so both question types compare selected option IDs against correct option IDs

## 4. Feedback and Quiz Flow

- [x] 4.1 Update feedback rendering to support text options and photo options
- [x] 4.2 Preserve review, retry, success, completion, and quiz flag behavior for both question types
- [x] 4.3 Update student-facing copy to avoid photo-specific language for text-choice rules

## 5. Verification

- [x] 5.1 Run `npm run build`
- [x] 5.2 Verify an existing photo-grid rule still loads, scores, retries, and blocks submission on image failure
- [x] 5.3 Verify a text-choice rule can be configured, activated, answered incorrectly with feedback, retried, and completed
- [x] 5.4 Verify mixed photo-grid and text-choice rules appear in configured order during onboarding
