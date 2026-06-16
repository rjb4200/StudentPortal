## 1. Database

- [x] 1.1 Create migration `007_quiz_flags.sql` with `quiz_flags` table (id, student_id, rule_id, rule_title, student_name, student_email, attempt_count, acknowledged, acknowledged_by, acknowledged_at, created_at) with UNIQUE(student_id, rule_id) constraint and RLS policies
- [x] 1.2 Apply migration to live Supabase project via `supabase_apply_migration`
- [x] 1.3 Regenerate TypeScript types via `supabase_generate_typescript_types` and update `src/lib/supabase/database.types.ts`

## 2. API Routes

- [x] 2.1 Create `src/app/api/quiz/flag/route.ts` — POST handler that validates studentId/ruleId, looks up rule title and student info, upserts into quiz_flags
- [x] 2.2 Create `src/app/api/admin/acknowledge-quiz-flag/route.ts` — POST handler that marks a flag as acknowledged by the current admin

## 3. KnowledgeGate — Component Architecture

- [x] 3.1 Extract `Header` sub-component into `src/components/onboarding/quiz-header.tsx` with progress bar, rule counter, and attempt display
- [x] 3.2 Extract `PhotoCard` sub-component into `src/components/onboarding/quiz-photo-card.tsx` supporting three visual modes: selection (image only + selected indicator), feedback-correct, feedback-incorrect, feedback-missed
- [x] 3.3 Extract `FeedbackPanel` sub-component into `src/components/onboarding/quiz-feedback-panel.tsx` — categorizes photos into missed/correct/incorrect groups with thumbnails, labels, reasons, and action buttons

## 4. KnowledgeGate — State & UX

- [x] 4.1 Expand mode state from `'rule' | 'question' | 'complete'` to `'rule' | 'question' | 'feedback' | 'success' | 'complete'`
- [x] 4.2 Implement persistent feedback panel (feedback mode): show categorized photo results with labels and reasons, "Review Rule" and "Retry" buttons, no auto-dismiss
- [x] 4.3 Implement success micro-feedback (success mode): "Correct!" with checkmark, auto-advance to next rule after 1.5s (or to complete after last rule)
- [x] 4.4 Hide photo labels and reasons during question mode — images only plus selection indicator during selection
- [x] 4.5 Replace `object-cover h-36` with `object-contain` inside `aspect-[4/3]` containers for full image visibility
- [x] 4.6 Add image `onError` handler with branded fallback placeholder (crimson accent, "Image unavailable")
- [x] 4.7 Add image loading skeleton with pulse animation during fetch
- [x] 4.8 Implement CSS slide transitions between modes using `translateX` / `opacity` with `transition-all duration-300`

## 5. KnowledgeGate — Mobile & Polish

- [x] 5.1 Make action buttons sticky on mobile (`sticky bottom-0` with backdrop blur) for question and feedback modes
- [x] 5.2 Update completion screen styling — use WFD branding colors and enhanced layout
- [x] 5.3 Track per-rule attempt count. On correct answer, if attempts >= 3, call `POST /api/quiz/flag` before advancing
- [x] 5.4 Add attempt-aware messaging in feedback panel: show "An instructor has been notified..." hint after attempt 3+

## 6. Admin Dashboard

- [x] 6.1 Add "Quiz Flags" card to `src/components/admin/daily-ops.tsx` — list unacknowledged flags with student name, rule title, attempt count, date
- [x] 6.2 Implement acknowledge button — calls `POST /api/admin/acknowledge-quiz-flag`, removes flag from active list
- [x] 6.3 Handle empty state: "No quiz flags" when no unacknowledged flags exist

## 7. Verification

- [x] 7.1 Run `npm run build` to verify no TypeScript or compilation errors
- [x] 7.2 Manual test: complete quiz with correct answers (verify success micro-feedback and slide transitions)
- [x] 7.3 Manual test: submit wrong answers 4 times then pass (verify persistent feedback, flag creation, and admin dashboard card)
- [x] 7.4 Manual test: broken image URL in quiz_photos (verify fallback UI)
- [x] 7.5 Manual test: mobile viewport (verify sticky buttons and photo card layout)
