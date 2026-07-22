## 1. Email Template for Admin Replies

- [x] 1.1 Add `buildAdminReplyStudentEmail` to `src/lib/email-templates.ts` — accepts student name, message excerpt, and dashboard link; returns WFD-branded HTML email with subject and body
- [x] 1.2 Add unit test for `buildAdminReplyStudentEmail` in `src/lib/email-templates.test.ts`

## 2. Admin Reply Email Notification

- [x] 2.1 Modify `POST /api/admin/messages/route.ts` to look up the student's email from the `students` table after inserting the reply
- [x] 2.2 Fire `sendEmail` with `buildAdminReplyStudentEmail` using best-effort pattern (log on failure, don't block response)
- [x] 2.3 Verify existing admin message reply flow still works end-to-end

## 3. Broadcast Email Delivery

- [x] 3.1 Create `POST /api/admin/broadcast-email` route — accepts `{ studentIds: string[], title: string, body: string }`, validates admin role, fans out emails via `Promise.all` with `sendEmail`
- [x] 3.2 Add "Also send by email" checkbox to broadcast modal in `MessagesPage` component
- [x] 3.3 Add "Also send by email" checkbox to broadcast modal in `DailyOps` component
- [x] 3.4 After broadcast insert succeeds, conditionally call `POST /api/admin/broadcast-email` if checkbox was checked

## 4. Admin Navigation Messages Badge

- [x] 4.1 Add optional `unreadMessageCount` prop to `AdminNavigation` component
- [x] 4.2 Render crimson badge (small circle, white text, absolute positioned) on the Messages tab when `unreadMessageCount > 0`
- [x] 4.3 Pass `unreadMessageCount` from `src/app/admin/page.tsx` — compute from inbox response or a lightweight count query
- [x] 4.4 Verify badge appears/disappears correctly when navigating between tabs and when conversations are marked read

## 5. Dashboard Messages Section Nav Badge

- [x] 5.1 Add crimson badge to the Messages section navigation button in `src/app/dashboard/page.tsx` when `unreadMessageCount > 0`
- [x] 5.2 Verify badge styling matches WFD design language and is consistent with admin nav badge
- [x] 5.3 Verify badge clears when student opens Messages section (mark-read fires)

## 6. Build Verification

- [x] 6.1 Run `npm run build` and fix any TypeScript or lint errors
- [x] 6.2 Run `npm run test` and verify all existing tests pass
- [x] 6.3 Manual smoke test: student sends message → admin replies → student receives email
- [x] 6.4 Manual smoke test: admin sends broadcast with email toggle → recipients receive both in-app and email
