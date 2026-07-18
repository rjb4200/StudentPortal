## Context

Daily Operations presents all student conversations as an undifferentiated alphabetical list. The `messages` table records only the sender and creation time, so the application cannot tell whether a particular admin has reviewed an incoming student message. The active `harden-student-messaging` change sends email alerts to opted-in admins, but email alerts do not provide an in-app triage state.

Administrators share the portal but operate independently. Reading a conversation must only affect the currently authenticated administrator's inbox state.

## Goals / Non-Goals

**Goals:**
- Persist per-admin unread state for student conversations.
- Make unread and needs-reply conversations visually distinct in Daily Operations.
- Keep the message list useful with a count, latest-message metadata, and unread-first ordering.
- Maintain existing message privacy and protected admin authorization.

**Non-Goals:**
- Student-side unread indicators for admin replies.
- Realtime subscriptions, typing indicators, or push notifications.
- Changing email notification delivery, assignment, or escalation rules.
- Requiring an administrator to reply before a conversation can be considered read.

## Decisions

### Store a per-admin conversation cursor

Add an `admin_message_thread_state` table with `admin_account_id`, `student_id`, and `last_read_student_message_at`. It has a unique key on the admin and student pair, foreign keys to both parent rows, and indexes for inbox lookups.

The state record is created lazily when an admin opens a conversation. A missing record means the admin has not read any student-originated message in that thread. This is preferred to a shared `messages.read_at` column because shared state would incorrectly mark a message read for all staff. It is also preferred to a receipt row for every message because a cursor is smaller and directly represents the only required behavior.

### Derive inbox status from the latest messages and cursor

For the authenticated admin, a thread is unread when its newest student message is later than `last_read_student_message_at`, or when no cursor exists. A thread needs reply when its latest message is from the student, regardless of whether the admin has already opened it.

The Student Messages list shows the student name, latest-message preview and timestamp, an accessible unread indicator, and a separate needs-reply cue. Unread threads sort before read threads; within each group, the most recently active thread appears first. A section-level unread count gives staff an immediate summary.

This separates awareness from workflow: opening a message clears the unread indicator for that administrator, while a student message remains visibly awaiting reply until staff sends an admin response.

### Acknowledge reads through an authenticated admin endpoint

When a thread is opened, the client calls an authenticated server endpoint that resolves the active admin account from the session and upserts the cursor using the latest student message time displayed for that thread. The endpoint never trusts an admin account identifier supplied by the browser.

Server-backed acknowledgement follows the existing server-backed message mutation model and makes per-admin authorization explicit. If acknowledgement fails, the client continues showing the conversation as unread and presents an actionable error rather than silently losing state.

### Load inbox summaries deliberately

Daily Operations loads summary data sufficient to render all threads before a conversation is selected. It refreshes the selected thread and inbox summary after an admin reply or a successful read acknowledgement. The initial release does not add a realtime subscription; new messages are reflected on the next page load or existing data refresh.

## Risks / Trade-offs

- [An admin opens a thread while a new student message is written] -> Acknowledge only through the latest known student timestamp and refresh summary data, so a later message remains unread.
- [One admin reads a thread and hides it for others] -> Store state keyed to the individual `admin_accounts` record, never on the message itself.
- [A visual indicator relies on color alone] -> Pair color with a textual unread count, a visible dot or label, and semantic accessible text.
- [Large rosters make client-side message aggregation expensive] -> Query or endpoint shape must return one summary per student thread rather than downloading complete message histories solely for the list.
- [An admin account is deactivated or deleted] -> Cascade cleanup of its cursor rows and exclude inactive accounts from inbox access.

## Migration Plan

1. Add the conversation-state table, foreign keys, unique constraint, index, and admin-only RLS policy in a numbered migration.
2. Apply the migration to the live Supabase project and regenerate database types.
3. Deploy inbox summary and read-acknowledgement endpoints with Daily Operations UI in the same release.
4. Verify with two admin accounts that reading a thread affects only the reader and that a later student message restores unread status.
5. Roll back application code if needed; the state table is additive and existing messages remain intact.

## Open Questions

- None for the initial release. Thread assignment and student-side reply indicators remain deferred.
