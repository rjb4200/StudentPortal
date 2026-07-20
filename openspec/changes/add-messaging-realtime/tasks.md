## 1. Database Migration

- [ ] 1.1 Run `ALTER TABLE public.messages REPLICA IDENTITY FULL;` in Supabase SQL editor
- [ ] 1.2 Add migration file `supabase/migrations/<timestamp>_realtime_messages.sql` with the DDL
- [ ] 1.3 Verify replication identity via `SELECT relreplident FROM pg_class WHERE relname = 'messages';` (should return `f` for full)

## 2. Realtime Subscription Hook

- [ ] 2.1 Create `src/lib/realtime.ts` with helper functions: `subscribeToStudentMessages(studentId, onInsert, onError)`, `subscribeToAdminInbox(adminId, onInsert, onError)`, `subscribeToAdminConversation(adminId, studentId, onInsert, onError)`
- [ ] 2.2 Each helper creates a Supabase Realtime channel with the correct `postgres_changes` filter, handles subscription lifecycle, and returns an unsubscribe function
- [ ] 2.3 Implement deduplication by message ID in the callback (skip if message already in local state)

## 3. Student Messages Real-time

- [ ] 3.1 Add `useEffect` with subscription to `src/components/dashboard/messages.tsx` — subscribe to `messages:student:{studentId}` channel
- [ ] 3.2 On INSERT event, append new message to local state if not already present (dedup by ID)
- [ ] 3.3 Clean up subscription on unmount via `useEffect` return function
- [ ] 3.4 Add `subscriptionStatus` state and a subtle reconnecting indicator

## 4. Admin Inbox Real-time

- [ ] 4.1 Add `useEffect` with subscription to `src/components/admin/messages-page.tsx` — subscribe to `messages:admin-inbox:{adminId}` channel
- [ ] 4.2 On INSERT event where `sender = 'student'`, update the `messageThreads` state: add new thread or update existing thread's preview/order
- [ ] 4.3 Re-sort threads using `orderMessageThreads()` after each update
- [ ] 4.4 Clean up subscription on unmount

## 5. Admin Conversation Real-time

- [ ] 5.1 Add subscription to admin conversation view in `MessagesPage` — subscribe to `messages:admin-convo:{adminId}:{studentId}` when a student is selected
- [ ] 5.2 On INSERT event, append new message to conversation if not already present
- [ ] 5.3 Tear down conversation subscription when admin switches to a different student or closes the conversation
- [ ] 5.4 Apply same conversation subscription pattern to `DailyOps` inline conversation view

## 6. Live Unread Badges

- [ ] 6.1 Update admin nav badge: subscribe to `messages:admin-inbox:{adminId}` in `src/app/admin/page.tsx` or lift badge count subscription into a shared hook
- [ ] 6.2 Increment unread count on new student message when not actively viewing the Messages tab
- [ ] 6.3 Update student dashboard badge: increment unread count on new admin message when not viewing Messages section
- [ ] 6.4 Clear badge counts appropriately when user marks messages as read or navigates to Messages

## 7. Subscription Cleanup and Edge Cases

- [ ] 7.1 Verify subscriptions clean up correctly in React StrictMode (double mount/unmount)
- [ ] 7.2 Handle channel subscription errors gracefully — log to console, show subtle disconnected state, fall back to fetch-on-navigate
- [ ] 7.3 Verify admin inbox still works if multiple tabs are open (each tab independently subscribes)

## 8. Build Verification

- [ ] 8.1 Run `npm run build` and fix any TypeScript errors
- [ ] 8.2 Run `npm run test` and verify all existing tests pass
- [ ] 8.3 Manual test: open student dashboard in one browser, admin in another — send messages, verify real-time delivery
- [ ] 8.4 Manual test: verify broadcast appears in student Messages view in real-time
