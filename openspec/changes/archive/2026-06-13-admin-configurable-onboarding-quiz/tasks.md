## 1. Database Schema & Seed Data

- [x] 1.1 Create Supabase migration for `quiz_rules` table with title, rule text, instruction, sort_order, is_active, timestamps
- [x] 1.2 Create Supabase migration for `quiz_photos` table with rule FK, label, image_url, is_non_compliant, reason, sort_order, is_active, timestamps
- [x] 1.3 Add indexes for active/sort-order quiz loading and rule-to-photo lookups
- [x] 1.4 Add RLS policies: admin full access, public read of active rules/photos only
- [x] 1.5 Seed default Hair/Grooming, PPE Readiness, and Station Conduct rules with 4-6 photos each
- [x] 1.6 Regenerate Supabase TypeScript types and update typed clients if needed

## 2. Admin Quiz Configuration UI

- [x] 2.1 Add quiz configuration section to Admin Command Center
- [x] 2.2 Build rule list UI showing title, active state, sort order, and photo count
- [x] 2.3 Build create/edit rule form with validation for title, rule text, instruction, active state, and sort order
- [x] 2.4 Build photo management UI per rule for label, image URL, non-compliant flag, reason, active state, and sort order
- [x] 2.5 Add admin-side validation preventing activation when a rule has fewer than 4 active photos, more than 6 active photos, or zero non-compliant photos
- [x] 2.6 Add image URL preview/fallback behavior in the admin editor

## 3. Student Quiz Runtime

- [x] 3.1 Replace hard-coded rules in `KnowledgeGate` with Supabase fetch of active rules and active photos ordered by sort_order
- [x] 3.2 Add loading, empty-state, and error-state UI for quiz configuration fetch
- [x] 3.3 Preserve rule-before-question flow using database-loaded rule content
- [x] 3.4 Preserve failed-answer behavior: show feedback, return to the same rule, then retry the same photo question
- [x] 3.5 Ensure quiz completion still triggers onboarding-complete notification without certifying the student client-side

## 4. Verification

- [x] 4.1 Verify anonymous onboarding can read active quiz content but cannot read inactive quiz content
- [x] 4.2 Verify non-admin users cannot create, update, or delete quiz rules/photos
- [x] 4.3 Verify admin can create/edit/deactivate rules and photos from the Admin Command Center
- [x] 4.4 Verify inactive rules/photos are hidden from student onboarding
- [x] 4.5 Verify failed student answers return to the rule before retrying
- [x] 4.6 Run production build and resolve any TypeScript/build issues
