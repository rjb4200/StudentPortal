## 1. Conversation State Data

- [x] 1.1 Create a numbered Supabase migration for per-admin, per-student message-thread read state, including foreign keys, uniqueness, indexes, and admin-only RLS.
- [x] 1.2 Apply the migration to the live Supabase project and regenerate `src/lib/supabase/database.types.ts`.
- [x] 1.3 Verify that state records are isolated between two admin accounts and unavailable to non-admin users.

## 2. Inbox Data and Read Acknowledgement

- [x] 2.1 Add an authenticated server endpoint that resolves the current active admin account and records the latest reviewed student-message timestamp for a selected thread.
- [x] 2.2 Add an inbox summary data path that returns each student thread's latest message metadata and the current admin's unread state without loading full thread histories for the list.
- [x] 2.3 Refresh the selected thread and summary after successful acknowledgement and after an admin reply.
- [x] 2.4 Add route tests for authorization, cross-admin isolation, stale read acknowledgements, and a new student message restoring unread state.

## 3. Daily Operations Inbox Experience

- [x] 3.1 Update Student Messages to render the unread count, empty state, latest-message preview, timestamp, and accessible unread indicator.
- [x] 3.2 Order unread conversations first and then order each state group by latest message activity.
- [x] 3.3 Display a separate needs-reply cue when the latest message in a thread is from the student.
- [x] 3.4 Acknowledge a thread as read when the authenticated admin opens it, retaining unread treatment and an actionable error if acknowledgement fails.
- [x] 3.5 Add focused component tests for unread rendering, ordering, needs-reply status, and per-admin read-state transitions.

## 4. Verification

- [x] 4.1 Run `npm run test` and resolve inbox-related failures.
- [x] 4.2 Run `npm run build`.
- [x] 4.3 Manually verify two admin sessions: each sees a new student message as unread, one admin opening it does not clear the other admin's indicator, and an admin reply retains the correct triage state.
- [x] 4.4 Run Supabase security and performance advisors after the migration and resolve or document new findings.

## Verification Notes

- The inbox function and thread-state table are inaccessible to `anon` and `authenticated`; only `service_role` can invoke the server-side summary function.
- Existing security advisor warnings concern pre-existing onboarding functions, public asset buckets, and leaked-password protection. No new security warning was introduced by this change.
- The new `admin_message_thread_state_student_id_idx` is currently reported unused because no production delete workload has used it yet. It is intentionally retained to cover the student foreign key and cascading cleanup.
