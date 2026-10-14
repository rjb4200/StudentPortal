## 1. Database

- [x] 1.1 Add a migration that extends `get_admin_message_inbox` to return `unread_count` (count of unread student messages per conversation) using `DROP FUNCTION` → `CREATE FUNCTION` → `GRANT EXECUTE ... TO service_role`
- [x] 1.2 Apply the migration live in the Supabase dashboard SQL editor (repo policy) and confirm the function returns `unread_count`
- [x] 1.3 Update `src/lib/supabase/database.types.ts` for the new function result shape

## 2. Types and API

- [x] 2.1 Add `unread_count: number` to `MessageThread` in `src/lib/message-inbox.ts` and update its test fixtures
- [x] 2.2 Confirm `/api/admin/message-inbox` GET passes `unread_count` through from the RPC
- [x] 2.3 Add an admin student-search endpoint `GET /api/admin/students?query=` returning minimal fields (`id, full_name, email, status`) for non-blacklisted students, admin-gated via `canAccessAdmin`
- [x] 2.4 Add request validation for the search query and deny non-admin access with no data leakage

## 3. Messages tab

- [x] 3.1 Accept an externally-selected student id in `MessagesPage` and open that conversation (including students with no history)
- [x] 3.2 Render the selected student as a synthetic current-conversation entry in the rail when they are not in the inbox, fetching identity when unknown
- [x] 3.3 Focus the composer when a conversation becomes selected
- [x] 3.4 Add a "New message" student picker (searchable, non-blacklisted, all statuses) that selects a student into the composer
- [x] 3.5 Call `loadInbox()` after a successful send so a newly started conversation appears without a reload
- [x] 3.6 Display the per-conversation unread count in the thread list entries

## 4. Daily Ops roster

- [x] 4.1 Add a Message action to Student Roster rows that navigates to `/admin?tab=messages&student=<id>`
- [x] 4.2 Add a per-student unread message count bubble on roster rows, sourced from the loaded inbox `messageThreads`, hidden at zero and not color-only
- [x] 4.3 Remove the unreachable duplicate conversation state from `daily-ops.tsx` (`activeStudentId`, `messages`, `replyText`, `handleSendReply`, `loadMessages`, and the `?student=` effect)
- [x] 4.4 Verify the Action Required "View Messages" button still navigates to the Messages tab and the aggregate count is unchanged

## 5. Admin page and deep link

- [x] 5.1 Parse the `student` query parameter in `src/app/admin/page.tsx` and pass the selected student id to `MessagesPage`
- [x] 5.2 Update selection when the URL changes (including `popstate`) so a second roster click re-targets the tab
- [x] 5.3 Ensure `/admin?tab=messages&student=<id>` selects the Messages tab and the student conversation

## 6. Email link

- [x] 6.1 Update `buildStudentMessageAdminEmail` conversation URL to `/admin?tab=messages&student=<id>`
- [x] 6.2 Update or add a test asserting the conversation link target

## 7. Verification

- [x] 7.1 Add unit tests for unread-count mapping and thread ordering in `src/lib/message-inbox.test.ts`
- [x] 7.2 Add API tests for `/api/admin/message-inbox` returning `unread_count` and `/api/admin/students` auth plus non-blacklisted filtering
- [x] 7.3 Run `npm run test` and `npm run build`
- [ ] 7.4 Manually verify: roster Message opens a focused composer; picker reaches a never-messaged student; roster bubble shows counts; roster-click re-targets; email link opens the conversation
- [ ] 7.5 Run `openspec validate admin-message-students --strict` and archive the change when complete
