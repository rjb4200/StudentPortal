## Context

The knowledge review quiz (`KnowledgeGate` component) uses a 3-mode state machine (rule → question → complete). Wrong answers flash a feedback banner for 1.8 seconds then auto-reset to the rule. Photos are displayed with `object-cover` at a fixed 144px height, clipping content. Labels and a "Tap/Selected" badge are always visible, giving away hints about which photos might be non-compliant. There's no image error handling, no transitions between modes, and no admin visibility into students who struggle.

The quiz runs entirely client-side — no results are persisted to the database.

## Goals / Non-Goals

**Goals:**
- Replace auto-dismiss feedback with persistent, educational panels showing per-photo results and reasons
- Hide photo labels and reasons during the selection phase so students must visually assess compliance
- Display images fully without clipping using `object-contain` and aspect-ratio containers
- Add image loading skeletons and error fallback UI
- Add brief success micro-feedback before advancing
- Add CSS slide transitions between rule/question/feedback modes
- Flag admins when a student passes a rule after 3+ failed attempts, with dashboard acknowledge
- Improve mobile photo card layout

**Non-Goals:**
- Persisting quiz results or attempt history for analytics
- Adding max attempt limits or lockouts
- Adding animation libraries (framer-motion, etc.) — CSS-only
- Changing the admin quiz configuration (rules/photos CRUD stays the same)
- Changing the onboarding completion flow or API

## Decisions

### 1. Five-mode state machine

**Decision**: Extend from 3 modes (`rule | question | complete`) to 5 (`rule | question | feedback | success | complete`).

**Rationale**: The 1.8s auto-dismiss pattern conflates a transient state with content rendering. Two new dedicated modes (`feedback` for persistent wrong-answer review, `success` for brief correct confirmation) make each state self-contained with its own UI, transitions, and user actions. This avoids timer-based hacks.

**Alternatives considered**: Using a modal/overlay for feedback (keeps question mode mounted). Rejected because the feedback panel should feel like a dedicated step in the learning flow, not an interruption.

### 2. CSS slide transitions (no library)

**Decision**: Apply directional `translateX` / `opacity` transitions on mode change using CSS classes with `transition-all duration-300`.

**Rationale**: No animation library is installed. Adding framer-motion or react-spring would introduce a dependency for a single component. CSS transforms are sufficient for card-level slide effects.

**Transitions**:
- rule → question: content slides left (`-translate-x-4 opacity-0` → `translate-x-0 opacity-100`)
- question → rule: content slides right (`translate-x-4 opacity-0` → `translate-x-0 opacity-100`)
- question → feedback: panel slides up (`translate-y-4 opacity-0` → `translate-y-0 opacity-100`)
- question → success: same as question → feedback
- feedback → rule/question: same direction rules as above

Implementation: use a transition key derived from `ruleIndex` + `mode` to trigger React re-mount or CSS animation classes.

### 3. Image display: object-contain with aspect ratio

**Decision**: Replace `object-cover h-36` with `object-contain` inside `aspect-[4/3]` containers.

**Rationale**: `object-cover` clips images to fill a fixed height. Admin-uploaded photos have varying aspect ratios. `object-contain` inside a fixed aspect-ratio container ensures the full image is visible while maintaining consistent card dimensions.

**Fallback**: `onError` handler swaps `src` to a CSS-styled placeholder div showing the WFD crimson icon and "Image unavailable" text. Skeleton pulse animation shows during initial load.

### 4. Hidden labels/reasons during selection

**Decision**: During `question` mode, photo cards render only the image and a minimal selection indicator (border + checkmark). Labels and reasons are stored in state and rendered only in `feedback` mode.

**Rationale**: The current UX shows the label text ("No hard hat worn") during selection, which can hint at the answer. For a visual compliance assessment, students should evaluate the photo itself.

**Accessibility**: `alt` text on images is preserved for screen readers. The selection state is communicated via `aria-pressed` and border styling.

### 5. Feedback panel structure (A3)

**Decision**: The persistent feedback panel categorizes photos into three groups: "Missed" (non-compliant, not selected), "Correctly identified" (non-compliant, selected), and "Incorrectly selected" (compliant, selected). Each photo shows a thumbnail, label, and the `reason` from the database.

**Rationale**: Categorizing results helps students understand both what they missed AND what they incorrectly flagged. Showing the `reason` column (already in the database but never surfaced to students) makes the quiz educational rather than purely pass/fail.

**Attempt tracking**: The panel shows the current attempt count. After attempt 3+, a note appears: "An instructor has been notified and can provide additional guidance."

### 6. Admin flagging on pass (not on fail)

**Decision**: `POST /api/quiz/flag` is called only when the student successfully submits a correct answer for a rule where `attempts >= 3`. The flag is created/updated in the `quiz_flags` table.

**Rationale**: The user clarified flags should fire retrospectively — when the student eventually succeeds after struggling. This keeps the flag informational ("this student struggled but passed") rather than a blocking mechanism. No max attempt limit — students retry freely.

**Deduplication**: `UNIQUE(student_id, rule_id)` constraint. If a flag already exists for this student+rule pair (e.g., from a previous session), the API upserts to update `attempt_count` and reset `acknowledged` to false.

**Admin dashboard**: New card in Daily Ops lists unacknowledged flags. "Acknowledge" button calls `POST /api/admin/acknowledge-quiz-flag` and removes the flag from the active list.

### 7. Mobile improvements

**Decision**: Photo grid stays `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Cards use `aspect-[4/3]` for consistent sizing. Submit/action buttons become sticky at the bottom on mobile (`sticky bottom-0`) with a subtle backdrop blur.

**Rationale**: Swipeable carousel was considered but rejected — students need to compare photos side-by-side to identify non-compliance. A grid with sticky actions keeps the comparison capability while improving thumb reach.

### 8. Database: quiz_flags table

**Decision**: New table with denormalized `rule_title`, `student_name`, `student_email` columns.

**Rationale**: Denormalization avoids joins in the admin dashboard query. These values are set at flag creation time and won't change meaningfully. The `UNIQUE(student_id, rule_id)` constraint prevents duplicate flags for the same student-rule pair.

## Risks / Trade-offs

- **Hidden labels may confuse some students** → Include a clear instruction: "Visually inspect each photo. Tap every photo that shows a policy violation." The "Review Rule" back button is always available.
- **Image fallback relies on `onError`** → If Supabase storage is down, ALL images fail simultaneously. The fallback UI handles this gracefully but the quiz becomes text-only. Consider a bucket health check in the loading phase.
- **`quiz_flags` table has no RLS for students** → Students can call `POST /api/quiz/flag` directly. This is acceptable since the flag is informational (not blocking). The API validates the student exists and the rule is active.
- **CSS transitions won't animate on first render** → Initial mount won't slide. Acceptable trade-off for zero-dependency approach.
- **Denormalized columns in quiz_flags** → If a rule title or student name is updated after flag creation, the flag shows stale data. This is acceptable for an informational flag that will be acknowledged and dismissed.

## Migration Plan

1. Apply migration `007_quiz_flags.sql` to Supabase
2. Generate updated TypeScript types
3. Deploy code changes (no breaking changes to existing flow)
4. Admin dashboard card appears empty until first flag is created

**Rollback**: Remove the migration (drop `quiz_flags` table). Revert code. Quiz functions identically without flags — the flag API call fails silently.
