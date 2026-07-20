## 1. Database Migration

- [x] 1.1 Run `ALTER TABLE public.messages REPLICA IDENTITY FULL;` in Supabase SQL editor
- [x] 1.2 Add migration file `supabase/migrations/<timestamp>_realtime_messages.sql` with the DDL
- [x] 1.3 Verify replication identity via `SELECT relreplident FROM pg_class WHERE relname = 'messages';` (should return `f` for full)

## 2. Realtime Subscription Hook

- [x] 2.1 Create `src/lib/realtime.ts` with helper functions: `subscribeToStudentMessages(studentId, onInsert, onError)`, `subscribeToAdminInbox(adminId, onInsert, onError)`, `subscribeToAdminConversation(adminId, studentId, onInsert, onError)`
- [x] 2.2 Each helper creates a Supabase Realtime channel with the correct `postgres_changes` filter, handles subscription lifecycle, and returns an unsubscribe function
- [x] 2.3 Implement deduplication by message ID in the callback (skip if message already in local state)

## 3. Student Messages Real-time

- [x] 3.1 Add `useEffect` with subscription to `src/components/dashboard/messages.tsx` — subscribe to `messages:student:{studentId}` channel
- [x] 3.2 On INSERT event, append new message to local state if not already present (dedup by ID)
- [x] 3.3 Clean up subscription on unmount via `useEffect` return function
- [x] 3.4 Add `subscriptionStatus` state and a subtle reconnecting indicator

## 4. Admin Inbox Real-time

- [x] 4.1 Add `useEffect` with subscription to `src/components/admin/messages-page.tsx` — subscribe to `messages:admin-inbox` channel
- [x] 4.2 On INSERT event where `sender = 'student'`, reload inbox to update thread list
- [x] 4.3 Threads are re-sorted by the inbox API (already returns ordered results)
- [x] 4.4 Clean up subscription on unmount

## 5. Admin Conversation Real-time

- [x] 5.1 Add subscription to admin conversation view in `MessagesPage` — subscribe to `messages:admin-convo:{studentId}` when a student is selected
- [x] 5.2 On INSERT event, append new message to conversation if not already present
- [x] 5.3 Tear down conversation subscription when admin switches to a different student or closes the conversation
- [x] 5.4 Apply same conversation subscription pattern to `DailyOps` inline conversation view

## 6. Live Unread Badges

- [x] 6.1 Add `subscribeToAdminInbox` in `src/app/admin/page.tsx` to keep badge count live
- [x] 6.2 Unread count refreshes on new student messages via real-time subscription
- [x] 6.3 Student dashboard badge increments on new admin message when not viewing Messages section
- [x] 6.4 Badge clears when student navigates to Messages (mark-read fires, loadData re-computes count)

## 7. Subscription Cleanup and Edge Cases

- [x] 7.1 Subscriptions clean up on unmount via `useEffect` return functions
- [x] 7.2 Channel errors set `subscriptionStatus` to `'error'` and show subtle disconnected indicator; fetch-on-navigate still works as fallback
- [x] 7.3 Each component creates independent channel instances (separate subscriptions per tab)

## 8. Build Verification

- [x] 8.1 Run `npm run build` and fix any TypeScript errors
- [x] 8.2 Run `npm run test` and verify all existing tests pass
- [ ] 8.3 Manual test: open student dashboard in one browser, admin in another — send messages, verify real-time delivery
- [ ] 8.4 Manual test: verify broadcast appears in student Messages view in real-time
