## Context

Daily Ops currently uses the `message_templates` table for three different purposes: general reusable reply/broadcast snippets, the welcome message preview, and fixed onboarding completion messaging. The user wants to remove the general-purpose Message Templates system because the current fixed messages are sufficient and admins do not need to create more reusable snippets.

## Goals / Non-Goals

**Goals:**

- Remove general-purpose message template management from Daily Ops.
- Remove template insertion dropdowns from 1:1 replies and broadcast composition.
- Preserve direct student/admin message threads.
- Preserve broadcast sending.
- Preserve fixed welcome/completion message behavior that depends on `message_templates` rows with specific template types.

**Non-Goals:**

- Do not drop the `message_templates` table.
- Do not remove welcome message preview or setup behavior.
- Do not remove onboarding completion message behavior.
- Do not change `messages` or `broadcasts` schema.
- Do not add a replacement canned-response system.

## Decisions

### Remove only `template_type = 'general'` usage from Daily Ops

Daily Ops should stop loading all message templates and should no longer expose create/edit/delete controls for reusable templates. The component may still query the single welcome template for its read-only preview card.

Alternative considered: remove the entire `message_templates` table and all template-related code. This was rejected because onboarding completion and welcome message behavior still use fixed template rows.

### Keep broadcasts as manually composed messages

The broadcast modal should continue collecting title and body and inserting messages for certified, non-blacklisted students. The only removed behavior is quick insertion from reusable templates.

Alternative considered: remove broadcasts too. This was rejected because the user only objected to creating additional message templates, not sending messages to all students.

### Update specs by removing the reusable template requirement

The `admin-configurable-messaging` spec should no longer require admins to create, edit, delete, or insert reusable message templates. Broadcast and fixed welcome message requirements should remain.

Alternative considered: modify the requirement to describe fixed templates. This was rejected because fixed onboarding/welcome messaging is already covered separately and should not be conflated with general reusable snippets.

## Risks / Trade-offs

- [Risk] Existing general templates remain in the database but are no longer editable from Daily Ops -> Mitigation: Leave them harmless and unused; a future data-cleanup migration can remove rows if desired.
- [Risk] Admins lose quick-insert convenience for common replies -> Mitigation: This matches the requested simplified workflow; messages and broadcasts remain fully manual.
- [Risk] Accidentally removing welcome/completion behavior -> Mitigation: Scope implementation to Daily Ops general templates and verify onboarding-related template reads remain intact.
