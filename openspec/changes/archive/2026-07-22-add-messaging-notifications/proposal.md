## Why

The messaging notification loop is incomplete: when a student messages staff, every active admin gets an email, but when an admin replies or sends a broadcast, the student gets nothing. Students must manually check the dashboard to discover new messages. Additionally, unread indicators exist only inside the dashboard summary card and inside the admin Messages tab — there are no notification badges on the navigation itself to proactively alert either role. Closing these gaps makes the messaging system feel responsive and professional without adding significant complexity.

## What Changes

- **Email student on admin reply**: When an admin sends a reply to a student conversation, the student receives an email notification via Resend with the message excerpt and a link to the dashboard Messages tab.
- **Email on broadcast**: The broadcast modal gains a checkbox — "Also send by email." When checked, all certified recipients receive the broadcast content via email in addition to the in-app message.
- **Badge on admin Messages tab**: The `AdminNavigation` component shows an unread count badge on the "Messages" tab when the authenticated admin has one or more unread conversations.
- **Badge on dashboard section nav**: The student dashboard section navigation shows an unread count badge on the "Messages" button when the student has one or more unread admin messages.

## Capabilities

### New Capabilities
- `admin-reply-email-notifications`: Email notification to students when an admin replies to their message thread.
- `broadcast-email-delivery`: Optional email delivery alongside in-app broadcast messages.
- `admin-nav-message-badge`: Unread count badge on the admin navigation Messages tab.
- `dashboard-nav-message-badge`: Unread count badge on the student dashboard Messages section button.

### Modified Capabilities
- `student-message-notifications`: Extends notification scope to include admin replies (currently only covers student→admin direction).
- `admin-message-inbox`: The Messages tab already shows an unread count internally; this extends that information to a persistent nav badge.
- `student-dashboard`: The dashboard already shows unread count in a summary card; this adds a badge to the Messages section navigation button.
- `student-message-read-tracking`: The read cursor is already tracked; the badge uses the same data for its count.
- `admin-configurable-messaging`: Broadcast composition gains the email toggle without changing how broadcasts are stored or delivered in-app.

## Impact

- **API routes**: `POST /api/admin/messages` (reply) gains email dispatch. New optional query/body handling in the broadcast path (client-side Supabase calls, no new API route).
- **Components**: `MessagesPage`, `DailyOps` (broadcast modal), `AdminNavigation`, `src/app/dashboard/page.tsx` (section nav), `Messages` (dashboard component — may need to re-trigger load on reply email link).
- **Email templates**: New `src/lib/email-templates.ts` builder for admin-reply-to-student email. Reuse existing broadcast pattern for broadcast emails.
- **Database**: No schema changes required. All counts use existing tables (`messages`, `student_message_read_state`, `admin_message_thread_state`).
