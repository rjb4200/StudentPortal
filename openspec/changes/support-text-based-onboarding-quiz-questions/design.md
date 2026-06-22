## Context

The current onboarding knowledge gate is a photo-grid compliance quiz. The database stores `quiz_rules` and `quiz_photos`; active rules are only shown to students when they have 4-6 active photos, and each photo requires an `image_url`. Admin configuration, student rendering, feedback, image-load blocking, and specs all assume photo-based answer options.

Training staff need to add text-based quiz questions that do not require photos while keeping the existing onboarding quiz sequence and behavior.

## Goals / Non-Goals

**Goals:**
- Support mixed quiz rules in one onboarding quiz sequence: photo-grid rules and text-choice rules.
- Add a per-rule question type toggle in admin configuration.
- Allow text-choice rules to use selectable text answer options without image URLs.
- Preserve existing photo-grid rules and behavior.
- Preserve retry, feedback, success, completion, and quiz flag behavior for both question types.

**Non-Goals:**
- Do not create a second separate quiz/test step.
- Do not introduce free-response typed grading in this change.
- Do not change onboarding completion, auth creation, or admin approval behavior.
- Do not require existing photo-grid quiz content to be recreated by admins.

## Decisions

- **Use one quiz engine with per-rule question types.** Add a rule-level question type such as `photo_grid` or `text_choice` rather than creating a second test section. This keeps progress, retries, feedback, completion, and admin flagging unified.
- **Generalize answer rendering, not the full onboarding flow.** The rule screen, success state, completion state, and flagging can remain shared; only the question and feedback renderers need to branch by question type.
- **Support text-choice with selectable options.** Text questions use the same select-and-submit pattern as photo-grid questions: students select every answer option that represents a policy violation or correct required answer, then receive feedback with reasons.
- **Prefer a minimal schema migration over a large table replacement.** Add a question type on `quiz_rules` and add text-option support to the existing answer-option storage unless implementation analysis proves a separate `quiz_options` table is safer. The current `quiz_photos` name is imperfect, but minimizing migration risk matters more for this change.
- **Keep existing media failure behavior limited to photo-grid rules.** Text-choice rules have no image load failure path and must not be blocked by missing media.

## Risks / Trade-offs

- **Risk: `quiz_photos` becomes a misleading table name.** -> Mitigation: treat rows as answer options in code where possible and document the compatibility choice. A future cleanup can rename/generalize the table if needed.
- **Risk: Active rule validation becomes too permissive.** -> Mitigation: validate by question type: photo-grid rules require active photo options with image URLs, while text-choice rules require active text options and at least one correct/non-compliant answer.
- **Risk: Existing rules disappear if migration defaults are wrong.** -> Mitigation: default existing and new rules to `photo_grid`, preserve current filters for photo-grid rules, and include compatibility checks in manual testing.
- **Risk: Feedback copy remains photo-specific.** -> Mitigation: update student-facing and admin-facing copy to use neutral terms such as “answer options” where the rule type is not photo-specific.
- **Risk: Supabase types drift from schema.** -> Mitigation: update `src/lib/supabase/database.types.ts` after applying the migration.

## Migration Plan

1. Add a schema migration for the rule question type and text answer-option support.
2. Backfill existing rules as `photo_grid`.
3. Relax image URL requirements only where text-choice answer options are allowed.
4. Update generated Supabase TypeScript types.
5. Update admin configuration validation and UI.
6. Update student quiz data loading, rendering, scoring, and feedback by question type.
7. Verify existing photo-grid rules and new text-choice rules both work in the same quiz sequence.

## Open Questions

- Should text-choice option correctness continue using the existing `is_non_compliant` field, or should the UI label it as “Correct answer” for text-choice rules while mapping to the same stored value?
- Should text-choice rules allow single-answer mode later, or is select-all-that-apply sufficient for the first version?
