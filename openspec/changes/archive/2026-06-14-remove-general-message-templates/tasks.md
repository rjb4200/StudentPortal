## 1. Daily Ops Data Cleanup

- [x] 1.1 Remove general template state from `DailyOps`: `templates`, `showTemplates`, template form fields, editing id, and saving flag.
- [x] 1.2 Stop loading all `message_templates` records in `loadAll` while preserving the welcome preview query.
- [x] 1.3 Remove general template handlers: save, delete, and insert/use-template logic.

## 2. Daily Ops UI Cleanup

- [x] 2.1 Remove the template dropdown from the individual student reply composer.
- [x] 2.2 Remove the template dropdown from the broadcast modal.
- [x] 2.3 Remove the entire Daily Ops "Message Templates" management card.
- [x] 2.4 Verify student message threads and manual broadcasts still compose/send from typed text.

## 3. Specs and Documentation

- [x] 3.1 Sync the `admin-configurable-messaging` main spec to remove the reusable admin message templates requirement.
- [x] 3.2 Update messaging security wording in the main spec so it no longer references general template writes.
- [x] 3.3 Update `AGENTS.md` messaging note if it still describes message templates as part of Daily Ops.

## 4. Verification

- [x] 4.1 Run `npm run build` to verify the Next.js application compiles.
- [x] 4.2 Search active source for leftover Daily Ops general-template UI references such as `showTemplates`, `handleSaveTemplate`, and `Insert template`.
