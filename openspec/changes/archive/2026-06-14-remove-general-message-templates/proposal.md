## Why

The Daily Ops Message Templates manager adds unnecessary complexity for the current workflow. Admins only need to edit fixed messaging content and send direct replies or broadcasts, not create an open-ended library of reusable reply/broadcast snippets.

## What Changes

- Remove the Daily Ops "Message Templates" create/edit/delete UI.
- Remove reusable template dropdowns from individual replies and broadcast composition.
- Stop loading all general message templates in Daily Ops.
- Keep student/admin message threads unchanged.
- Keep broadcast sending unchanged, except broadcasts will be typed manually rather than populated from reusable templates.
- Keep fixed welcome/completion message behavior intact; do not remove the `message_templates` table because onboarding still uses fixed template types.
- Update OpenSpec to remove the reusable admin message templates requirement.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-configurable-messaging`: Remove support for general-purpose reusable message templates while preserving broadcasts and fixed welcome message behavior.

## Impact

- Affects `src/components/admin/daily-ops.tsx` by simplifying messaging state, loading, handlers, and UI.
- Affects `openspec/specs/admin-configurable-messaging/spec.md` by removing the reusable template requirement and narrowing security language.
- May affect `AGENTS.md` messaging notes if they still describe templates as part of Daily Ops.
- No database migration is expected because `message_templates` remains needed for fixed onboarding-related messages.
