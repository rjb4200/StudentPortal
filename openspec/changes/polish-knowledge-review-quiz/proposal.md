## Why

The knowledge review quiz is functional but feels unpolished for a professional EMS training portal. Feedback disappears in 1.8 seconds before students can study it, images are clipped by `object-cover`, labels reveal answers during selection, and admins have no visibility into students who struggle repeatedly on specific rules. This change polishes the quiz to meet professional training expectations and WFD branding standards.

## What Changes

- **Persistent feedback panels** replace the 1.8-second auto-dismiss flash. Incorrect answers show which photos were missed, which were incorrectly selected, and the reason for each — letting students study feedback before retrying.
- **Photo labels and reasons hidden during selection** — students must visually identify non-compliance from photos alone. Labels and reasons are revealed only after submitting.
- **Images fully visible** — `object-contain` with proper aspect-ratio containers replaces `object-cover` so no photo content is clipped.
- **Media fallback UI** — broken images show a branded placeholder instead of the browser's default broken-image icon. Loading skeletons appear while images fetch.
- **Success micro-feedback** — a brief "Correct!" animation appears before advancing to the next rule or completion.
- **Slide transitions** between rule/question/feedback modes using CSS `translateX` animations.
- **Admin flagging** — when a student eventually passes a rule after 3 or more failed attempts, a flag is sent to the admin dashboard. Admins can acknowledge (dismiss) the flag. No max attempt limit — students can retry freely.
- **Improved mobile layout** — better photo card sizing and sticky submit button on small screens.

## Capabilities

### New Capabilities
- `quiz-feedback-panels`: Persistent incorrect-answer feedback showing missed/incorrect photos with reasons, success micro-feedback, image loading states, and image error fallback UI.
- `quiz-admin-flags`: Admin dashboard card showing students who passed rules after 3+ failed attempts, with acknowledge/dismiss capability. New `quiz_flags` database table and API routes.

### Modified Capabilities
- `admin-configurable-onboarding-quiz`: The incorrect-answer scenario changes from brief auto-dismiss feedback to a persistent dismissable panel. The retry flow still returns to the rule, but now via manual button press rather than automatic timeout.
- `student-onboarding`: Quiz behavior scenarios updated — hidden labels during selection, slide transitions between modes, image error fallback, and per-rule attempt tracking for flag threshold.

## Impact

- **Files**: `src/components/onboarding/knowledge-gate.tsx` (major rework — state machine, photo cards, feedback panels, transitions), `src/components/admin/daily-ops.tsx` (new quiz flags card)
- **Database**: New `quiz_flags` table (migration `007_quiz_flags.sql`)
- **API**: New `POST /api/quiz/flag` (student client), new `POST /api/admin/acknowledge-quiz-flag` (admin)
- **Dependencies**: None — all CSS-based, no new packages
- **BREAKING**: None
