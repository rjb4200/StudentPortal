## Context

The admin messaging model has no threads table: a "conversation" is the set of `messages` rows for a student, and the admin inbox is produced by `get_admin_message_inbox(admin_account_id)`, whose CTE starts from `messages`. Consequently a student with no message history is invisible and unreachable, even though the send endpoint (`POST /api/admin/messages`) already inserts an admin message for any `student_id` and emails the student.

Two admin surfaces exist: Daily Ops (which owns the Student Roster) and a dedicated Messages tab. Daily Ops carries duplicate, currently-unreachable conversation state (`activeStudentId`, `messages`, `replyText`, `handleSendReply`, `loadMessages`, and a `?student=` effect gated on the student already being in `messageThreads`). The Messages tab owns the real thread UI. An existing `admin-command-center` requirement already claims the Messages tab selects a conversation from a `student` query parameter, and the admin notification email links to `?tab=daily&student=<id>` — but `admin/page.tsx` only reads `tab`, so the link is dead.

## Goals / Non-Goals

**Goals:**
- Start a 1:1 conversation with any non-blacklisted student (pending, certified, expired), including students with no history.
- A roster row action that lands the admin in the Messages tab, that student selected, composer focused.
- A per-student unread message count bubble on the roster.
- One deep-link contract (`?tab=messages&student=<id>`) that also repairs the admin email link.
- A single owner of "open a student conversation."

**Non-Goals:**
- Bulk/targeted group messaging (broadcast stays all-certified).
- Introducing a `threads` table or per-admin conversation partitions.
- Multi-recipient selection ("message these N").
- Changes to the student-side messaging UI.
- Cleaning up unrelated pre-existing RLS metadata inconsistencies.

## Decisions

**1. Handoff mechanism: URL deep link `?tab=messages&student=<id>`.**
The roster action navigates with this URL; `admin/page.tsx` reads `student` and passes it to the Messages tab. Alternatives: extend `onNavigateMessages(studentId)` in memory (not refresh-safe, not shareable, doesn't fix the email link) — rejected. The URL form lets `buildStudentMessageAdminEmail` point at a real destination.

**2. Centralize conversation ownership in the Messages tab.**
Remove Daily Ops' duplicate conversation state and its `?student=` effect; Daily Ops only navigates. This eliminates two divergent implementations of "open a conversation."

**3. Unread count from the inbox RPC, extended with `unread_count`.**
Add an `unread_count` column to `get_admin_message_inbox` = count of `sender='student'` messages with `created_at` after the admin's `last_read_student_message_at` (all messages when no state row exists). Alternatives: client-side counting over fetched messages (wasteful; needs the admin's scope), a separate endpoint (extra round-trip), or a boolean dot only (insufficient — requirement is a count). Because the function's `RETURNS TABLE` changes, the migration must `DROP FUNCTION` then re-create and re-apply the `GRANT EXECUTE ... TO service_role`.

**4. Student directory via a dedicated admin search endpoint.**
Add `GET /api/admin/students?query=` (service-role, admin-gated) returning minimal fields `id, full_name, email, status` for non-blacklisted students, searchable by name/email. Alternatives: reuse the inbox endpoint (it is message-state-shaped, not a directory), or client-side `from('students')` (dumps the whole roster into the messages tab and leans on RLS). A scoped admin endpoint keeps payloads small and status filtering explicit.

**5. External selection model in the Messages tab.**
MessagesPage accepts a selected student that may not be in `messageThreads`. It renders the selection as a synthetic "current conversation" entry in the rail and, when identity is unknown, fetches the student row. Selection triggers composer focus via a ref. This keeps the existing rail as the single navigation model.

**6. Inbox refresh after an admin-initiated send.**
`subscribeToAdminInbox` filters `sender=eq.student`, so admin sends emit no event. After a successful send, MessagesPage calls `loadInbox()` explicitly so a newly started conversation appears. Broadening the realtime filter was rejected as scope creep.

**7. Roster bubble reuses loaded thread state.**
Daily Ops already fetches the inbox in `loadAll`; map `student_id → unread_count` and render a text badge on roster rows, hidden at zero.

## Risks / Trade-offs

- **RPC return-type change** → migration must `DROP`/`CREATE` and re-grant; apply live via the Supabase SQL editor per repo policy and regenerate `database.types.ts`. Old callers ignore the extra field, so rollback is safe.
- **Directory exposure** → endpoint returns minimal fields and is admin-only; non-admin requests are denied (spec scenario).
- **Composer autofocus** → auto-focus can be unexpected on small screens; guard so focus only occurs when a conversation is actively selected.
- **Removing Daily Ops conversation state** → verify nothing else depends on the old `?student=` behavior on Daily Ops before deleting; it was gated to existing threads and had no rendering surface.
- **Blacklisted asymmetry** → blacklisted students with history still appear in the rail (existing behavior) while the picker excludes them; acceptable, noted.
- **Per-admin counts** → the bubble reflects the viewing admin's own unread state, matching `admin_message_thread_state`.

## Migration Plan

1. Add a migration extending `get_admin_message_inbox` with `unread_count` (`DROP FUNCTION` → `CREATE FUNCTION` → `GRANT EXECUTE`), and apply it live.
2. Update `src/lib/supabase/database.types.ts` for the new function shape.
3. Ship code changes (types, endpoint, MessagesPage, Daily Ops, admin page, email template) together.
4. Rollback: revert code; the RPC gains a column only, which older code tolerates.

## Open Questions

- Should the picker offer a "recently messaged" shortcut, or is search sufficient for v1? (Assumed search-only.)
- Should messaging an `expired` student surface any access caveat in the UI, or is silent success acceptable? (Assumed silent success.)
- Is a per-student count bubble also wanted in the Action Required "Unread Messages" item, or does the aggregate stay as-is? (Assumed aggregate unchanged.)
