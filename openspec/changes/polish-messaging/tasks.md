## 1. Database Migration

- [x] 1.1 Create migration SQL for `student_message_read_state` table with `student_id` PK, `last_read_admin_message_at`, `updated_at`, CASCADE deletes, and RLS policy restricting to authenticated student
- [x] 1.2 Apply migration to Supabase live project via SQL editor
- [x] 1.3 Regenerate TypeScript types with `supabase_generate_typescript_types` and update `src/lib/supabase/database.types.ts`

## 2. Student Mark-Read API

- [x] 2.1 Create `src/app/api/messages/mark-read/route.ts` — POST endpoint that resolves authenticated student, queries latest admin message timestamp, upserts `student_message_read_state`, returns `{ acknowledged: boolean }`
- [x] 2.2 Add Zod validation schema for the mark-read request if needed

## 3. Student Dashboard — Unread Count

- [x] 3.1 Update `loadData()` in `src/app/dashboard/page.tsx` to query unread admin message count instead of total message count
- [x] 3.2 Update the Messages SummaryCard to display unread count with appropriate labeling (e.g., "3 unread from your staff")
- [x] 3.3 Add a `refreshMessageCount` callback prop pattern from dashboard to Messages component so the count updates after mark-read

## 4. Student Messages UI Polish

- [x] 4.1 Fix timestamp opacity: change `text-wfd-crimson/20` to `text-white/60` for student-sent message timestamps
- [x] 4.2 Add `formatMessageTime()` utility: today → time only, yesterday → "Yesterday 3:45 PM", this week → day name + time, older → short date + time
- [x] 4.3 Add `<LoadingState>` during initial `loadMessages()` — show skeleton while data is fetching
- [x] 4.4 Add send-failure retry: show a small retry indicator on the message bubble when a send fails, preserving the alert at top
- [x] 4.5 Add character counter below the input (e.g., "142/2000") using `newMessage.length`
- [x] 4.6 Add context note below the message list: "Messages are typically answered within 24 hours on business days."
- [x] 4.7 Add visual unread marker (crimson dot or "New" badge) on admin messages with `created_at` after the student's read cursor
- [x] 4.8 Change fixed `h-[500px]` to responsive `min-h-[60vh] max-h-[calc(100vh-16rem)]`
- [x] 4.9 Add `POST /api/messages/mark-read` call on Messages component mount to mark messages as read
- [x] 4.10 Ensure `aria-label` on message bubbles and `role="log"` on the message list for accessibility

## 5. Admin Navigation Reorder

- [x] 5.1 Update `AdminSection` type in `src/components/admin/admin-navigation.tsx` to include `'messages'`
- [x] 5.2 Reorder `primaryItems`: Daily Operations, Calendar, Messages, Registry, Maintenance & Archive
- [x] 5.3 Move Preceptor Analytics to `secondaryItems` (hamburger menu)
- [x] 5.4 Update `src/app/admin/page.tsx` tabs array and `AdminSection` imports

## 6. Admin Messages Page

- [x] 6.1 Create `src/components/admin/messages-page.tsx` extracting thread list + message view from `daily-ops.tsx` into a standalone component
- [x] 6.2 Style with WFD branding: branded header (charcoal/white), improved thread list spacing, responsive layout
- [x] 6.3 Add loading state while inbox loads, error state for inbox fetch failure
- [x] 6.4 Add timestamp formatting consistent with student side
- [x] 6.5 Preserve existing functionality: thread selection, mark-as-read on open, reply send, broadcast modal
- [x] 6.6 Render `<MessagesPage />` in `src/app/admin/page.tsx` under the `'messages'` tab case

## 7. Action Required Unread Card (Daily Ops)

- [x] 7.1 Remove the "Student Messages" section from `src/components/admin/daily-ops.tsx`
- [x] 7.2 Add "Unread Messages" item to Action Required: crimson badge, thread count, "View Messages" button
- [x] 7.3 Add `unreadMessageCount` to `totalActions` calculation
- [x] 7.4 Wire "View Messages" button to navigate to Messages tab
- [x] 7.5 Keep `loadMessageInbox()` call in Daily Ops to populate the unread count for Action Required

## 8. Verification

- [x] 8.1 Run `npm run build` to verify no compilation errors
- [x] 8.2 Run `npm run test` to verify existing tests pass
- [ ] 8.3 Manual test: student sends message, admin replies, student sees unread count on dashboard, count clears after opening Messages tab
- [ ] 8.4 Manual test: admin sees unread count in Action Required, clicks View Messages, navigates to Messages tab
- [ ] 8.5 Manual test: Preceptor Analytics accessible from hamburger menu
- [ ] 8.6 Manual test: timestamps display correctly, character counter works, no layout breakage on mobile
