## Why

The onboarding quiz currently only supports photo-grid compliance questions, which prevents training staff from adding policy or protocol questions that are text-based and do not require photos. The quiz should support text-based questions while preserving the existing onboarding review flow, retry behavior, feedback, completion, and admin flagging.

## What Changes

- Add support for per-rule onboarding quiz question types: `photo_grid` and `text_choice`.
- Update admin quiz configuration so each quiz rule can be configured as photo-based or text-based.
- Allow text-based rules to define selectable text answer options without requiring image URLs.
- Update the student knowledge gate to render either photo-grid or text-choice questions within the same quiz sequence.
- Preserve existing rule-before-question, retry, feedback, success, completion, and admin flag behavior.
- Keep existing photo-grid quiz rules working without requiring admins to recreate them.

## Capabilities

### New Capabilities
- `text-based-onboarding-quiz-questions`: Text-choice onboarding quiz questions that do not require photos and integrate with the existing onboarding quiz flow.

### Modified Capabilities
- `admin-configurable-onboarding-quiz`: Admin quiz configuration supports selecting a question type and managing text answer options.
- `student-onboarding`: Student knowledge gate supports both photo-grid and text-choice rules in the same quiz sequence.

## Impact

- Supabase schema migration for quiz rule question type and text-choice answer options.
- Supabase generated TypeScript types must be updated after the schema change.
- Admin quiz configuration UI (`src/components/admin/quiz-config.tsx`) must support text-choice rule configuration and validation.
- Student knowledge gate (`src/components/onboarding/knowledge-gate.tsx`) and feedback components must render answer options based on rule type.
- Existing quiz photo behavior, media-load blocking, attempts, feedback, and quiz flagging must continue to work.
- Verification: `npm run build` plus manual/targeted quiz flow checks for both photo-grid and text-choice rules.
