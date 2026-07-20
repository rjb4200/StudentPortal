## Context

The messaging system currently has asymmetric notifications: student→admin triggers email, but admin→student does not. Broadcasts are in-app only. Unread counts exist but are not surfaced on navigation elements. The Resend email infrastructure (`src/lib/email.ts`, `src/lib/email-templates.ts`) is already proven with 13 template builders and is used across onboarding, scheduling, evaluations, and student message alerts. This change layers on additional notification paths and UI badges without new infrastructure.

## Goals / Non-Goals

**Goals:**
- Student receives an email when an admin replies to their conversation
- Broadcast composer has an optional "also send by email" toggle
- Admin navigation shows a crimson unread badge on the Messages tab
- Student dashboard section nav shows an unread badge on the Messages button

**Non-Goals:**
- Real-time/live updates (that's `add-messaging-realtime`)
- SMS or push notifications
- Message attachments
- Changes to the Resend infrastructure or email HTML template

## Decisions

### 1. Admin reply email: fire from existing API route

**Decision**: Add email dispatch inside `POST /api/admin/messages/route.ts`, after the message is inserted.

**Why**: Single-responsibility — the route already validates, inserts, and returns. Adding email here keeps the notification co-located with the action that triggers it. The student's email is available from the `students` table (already queried elsewhere in the same pattern).

**Alternatives considered**: A separate notification service or queue. Overkill for this — the existing `Promise.all` pattern (used in `POST /api/messages` for student→admin emails) is simple and proven. Delivery is best-effort; message persistence is not gated on email success.

### 2. Broadcast email: checkbox toggle, client-side fan-out

**Decision**: Add a `sendEmail` checkbox to the broadcast modal in both `MessagesPage` and `DailyOps`. When checked, after the broadcast insert + batch message insert completes, fan out emails to all recipients via the existing `sendEmail` function.

**Why**: Broadcasts are sent from the client (Supabase anon client) since all certified students can be queried from the `students` table (RLS allows admin reads). Email sending must go through a server endpoint (Resend API key is server-only). So either: (a) create a new API route for broadcast email, or (b) call `POST /api/admin/messages` extended with a broadcast flag. Option (a) is cleaner — a new `POST /api/admin/broadcast-email` route that accepts a list of student IDs + message content and dispatches emails. The client calls it after the broadcast insert succeeds.

**Alternatives considered**: Always email on broadcast (no toggle). Rejected — some broadcasts are low-urgency and shouldn't clutter inboxes. Making it optional respects admin intent.

### 3. Admin nav badge: lightweight count query

**Decision**: `AdminNavigation` accepts an optional `unreadMessageCount` prop. The parent (`src/app/admin/page.tsx`) fetches the unread count from the existing `GET /api/admin/message-inbox` response (which already returns per-thread `is_unread` flags). Badge displays as a small crimson circle with white text next to the "Messages" tab label.

**Why**: The inbox API already returns all the data needed. No new endpoint. The count is the number of threads where `is_unread === true`. The badge itself is purely presentational — a `<span>` with absolute positioning.

**Alternatives considered**: Separate API endpoint for just the count. Unnecessary — the inbox is already fetched on mount in both admin views.

### 4. Dashboard nav badge: reuse existing unreadCount state

**Decision**: The `src/app/dashboard/page.tsx` already computes `unreadMessageCount` in `loadData()`. Add a small crimson badge to the Messages section navigation button when `unreadMessageCount > 0`.

**Why**: Zero new data fetching. The count is already in component state. Just display it on the nav button alongside the summary card that already shows it.

### 5. New email template: `buildAdminReplyStudentEmail`

**Decision**: Add a 14th template builder to `src/lib/email-templates.ts`. It mirrors `buildStudentMessageAdminEmail` but reversed: includes the admin's reply text, the student's name, and a direct link to the dashboard Messages tab.

**Pattern**: Reuse the existing WFD-branded HTML wrapper via `buildEmailHtml()`. Subject: "New reply from WFD EMS staff." Body: message excerpt + CTA button to dashboard.

## Risks / Trade-offs

- **Email volume**: If an admin replies frequently, the student gets an email each time. Mitigation: This is expected — the existing student→admin path already emails all active admins per message. The volume is symmetric.
- **Broadcast email fan-out**: A broadcast to 100 students sends 100 emails. Mitigation: The checkbox is opt-in, so admins choose when the volume is warranted. The existing `Promise.all` pattern handles concurrent sends.
- **Badge count staleness**: Without real-time, badges only update on page load or explicit refresh. Mitigation: This is the current behavior for ALL messaging data. Real-time (separate change) will address this. For now, navigating between sections or refreshing updates the count.
