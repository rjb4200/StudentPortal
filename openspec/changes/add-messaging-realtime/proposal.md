## Why

Today all message data is fetched on-demand when users interact with the UI. Students must refresh or navigate to Messages to see new replies. Admins must reload the inbox to discover new student messages. The unread badge (added in `add-messaging-notifications`) will show stale counts until the next page interaction. Supabase Realtime is available in the project but completely unused — enabling it for messaging would make the experience feel live and responsive without polling.

## What Changes

- **Supabase Realtime subscriptions**: Both the student Messages component and the admin inbox subscribe to `messages` table changes filtered to their scope (student's own thread or all student threads for admins).
- **Live message delivery**: New messages appear in the conversation view immediately without manual refresh — student sees admin replies appear, admin sees new student messages appear.
- **Live unread counts**: Unread badge counts (both admin nav badge and student dashboard nav badge) update automatically when new messages arrive or conversations are read.
- **Live broadcast delivery**: When an admin sends a broadcast, subscribed certified students see it appear in their message thread immediately.
- **Subscription lifecycle**: Subscriptions are created on component mount (when messaging UI is visible) and torn down on unmount to avoid memory leaks. Resubscription handles connection drops gracefully.

## Capabilities

### New Capabilities
- `messaging-realtime`: Core real-time messaging infrastructure using Supabase Realtime subscriptions for live message delivery, live unread counts, and live broadcasts.

### Modified Capabilities
- `student-message-notifications`: Message delivery shifts from on-demand fetch to real-time subscription while keeping the existing API as the authoritative source and fallback.
- `admin-message-inbox`: Inbox becomes live-updating; new student messages appear without refresh. The internal unread count and nav badge stay current.
- `student-message-read-tracking`: Read cursors remain server-authoritative; real-time only delivers new messages and triggers optimistic unread count updates. Mark-read calls remain API-based.
- `student-dashboard`: Unread count in the summary card and section nav badge become live-updating.
- `admin-configurable-messaging`: Broadcast delivery becomes live for subscribed students; the storage and composition pattern remains unchanged.

## Impact

- **New dependency**: Supabase Realtime (already part of the `@supabase/supabase-js` client, no new package install required). Requires enabling `REPLICATION` on the `messages` table.
- **Database**: `ALTER TABLE messages REPLICA IDENTITY FULL;` to enable real-time change capture with complete row data. No schema changes otherwise.
- **Components**: `Messages` (student), `MessagesPage` (admin), `DailyOps` (admin inbox portion), `AdminNavigation` (badge count), `src/app/dashboard/page.tsx` (summary card + section nav badge).
- **Architecture**: Introduces a client-side subscription layer. State management shifts from pure `useState`/`useEffect` to `useState` + `useEffect` subscription lifecycle. No global state store required — subscriptions are scoped to the component that owns the data.
- **Risk**: Realtime is additive — all existing API routes remain the authoritative source. If a subscription fails, the UI falls back to on-demand fetch behavior (current behavior). No data integrity risk.

## Relationship to `add-messaging-notifications`

This change is designed to follow `add-messaging-notifications`. The badges added in that change become live-updating here. No rework — the badge components get an additional data source (subscription events) alongside the existing on-mount fetch. The two changes are independent; real-time can be implemented before or after notifications without conflict.
