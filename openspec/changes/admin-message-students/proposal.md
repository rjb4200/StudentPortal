## Why

Admins can only message students who already have a message thread, because the admin inbox is seeded from existing messages (`get_admin_message_inbox` starts from `messages`). There is no way to start a conversation with a student who has never messaged staff — exactly the outreach cases that matter: nudging a pending applicant, re-engaging an expired student, or checking in with a certified student. Staff also have no at-a-glance signal of who has unread messages while working the roster.

## What Changes

- Add a **Message** action to each Student Roster row (Daily Ops) that opens the Messages tab with that student's conversation selected and the composer focused, ready to type.
- Add a **New message** entry in the Messages tab that opens a searchable picker of all non-blacklisted students (`pending`, `certified`, `expired`) to start a conversation.
- Allow the Messages tab to open a conversation for a student with **no prior message history** (empty thread plus a working composer). The send path already supports this; only the selection UI is missing.
- Show a **per-student unread message count bubble** on Student Roster rows for students whose messages the admin has not yet read.
- Establish a URL contract `?tab=messages&student=<id>` for deep-linking a conversation, and repair the admin notification email link, which currently targets a non-functional `?tab=daily&student=<id>`.
- Refresh the admin inbox after an admin-initiated send so the new thread appears immediately (realtime only announces student-originated messages).
- Remove the unreachable duplicate conversation state in Daily Ops so there is a single place that owns "open a student conversation."

## Capabilities

### New Capabilities

<!-- None: this extends existing messaging capabilities. -->

### Modified Capabilities

- `admin-command-center`: the Student Roster gains a per-row Message action and a per-student unread message count bubble; the deep-link scenario is corrected to select the conversation in the Messages tab instead of Daily Operations.
- `admin-message-inbox`: the inbox exposes a per-conversation unread **count**; the Messages tab can open a conversation for any non-blacklisted student — including those with no prior messages — through a student picker.

## Impact

- **UI**
  - `src/components/admin/daily-ops.tsx` — add roster Message action and unread count bubble; remove dead conversation state (`activeStudentId`, `messages`, `replyText`, `handleSendReply`, `loadMessages`, and the `?student=` effect) so selection lives only in the Messages tab.
  - `src/components/admin/messages-page.tsx` — accept an externally-selected student, render a non-thread student, focus the composer, add the "New message" picker, refresh the inbox after send.
  - `src/app/admin/page.tsx` — read the `student` query parameter and pass the selected student id to the Messages tab alongside `?tab=`.
- **API**
  - `/api/admin/message-inbox` — return the unread count per thread.
  - A student directory source for the picker (new admin student search endpoint or an extension of the inbox response).
  - `/api/admin/messages` — no change expected; it already inserts an admin message for any student id and emails the student.
- **Database** — extend the `get_admin_message_inbox` RPC with a per-conversation unread count (migration; a return-type change requires `DROP FUNCTION` before re-create). No new tables.
- **Types** — `MessageThread` in `src/lib/message-inbox.ts` gains the unread count.
- **Email** — `buildStudentMessageAdminEmail` conversation link target becomes `?tab=messages&student=<id>`.
