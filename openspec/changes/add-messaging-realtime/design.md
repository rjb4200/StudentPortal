## Context

Supabase Realtime is built into the `@supabase/supabase-js` client already used by the app — no new package dependency. It provides PostgreSQL change-data-capture via WebSocket: clients subscribe to `postgres_changes` events (`INSERT`, `UPDATE`, `DELETE`) on specific tables with optional filters. The `messages` table needs `REPLICA IDENTITY FULL` to include complete row data in change events (default is `DEFAULT` which only sends primary key for UPDATE/DELETE — we need full rows for INSERT events to avoid re-fetching).

Currently, all messaging state is loaded once on mount via `useEffect` and never updated until the user navigates away and back or manually refreshes. This change adds a subscription layer that listens for new messages and updates state in real-time.

## Goals / Non-Goals

**Goals:**
- Student sees new admin messages appear in their conversation view without refresh
- Admin inbox list updates when a new student sends a message
- Admin conversation view shows new student messages in real-time when viewing a thread
- Unread badge counts (admin nav, dashboard nav) update live
- Broadcasts appear in student message threads immediately

**Non-Goals:**
- Typing indicators or presence
- Real-time read receipts
- Message editing or deletion via real-time
- Any changes to the API routes or database schema beyond `REPLICA IDENTITY`
- Replacing the existing fetch-on-mount pattern (real-time is additive)

## Decisions

### 1. Subscription scope: per-role channels

**Decision**: Create scoped channels based on role and context.

```
Student channel:  messages:student:{studentId}
  → INSERT on messages WHERE student_id = studentId
  
Admin inbox channel:  messages:admin-inbox:{adminId}
  → INSERT on messages WHERE sender = 'student'
  
Admin conversation channel:  messages:admin-convo:{adminId}:{studentId}
  → INSERT on messages WHERE student_id = studentId
  (created only when viewing a specific conversation)
```

**Why**: The student only needs their own messages. The admin needs two scopes: (1) all student-originated messages for the inbox list, and (2) all messages in the active conversation when drilling into a thread. Separating inbox and conversation subscriptions means the conversation subscription is only active while viewing a thread, reducing unnecessary events.

**Alternatives considered**: One admin channel for all INSERTs. Simpler but fires on every admin reply too (which the sending admin already has via optimistic UI). Filtering to `sender = 'student'` reduces noise.

### 2. State merging: append with dedup

**Decision**: On receiving a subscription event, check if the message ID already exists in local state. If not, append to the array. Use `created_at` for ordering.

**Why**: Avoids duplicate messages when the initial fetch and subscription both deliver the same row. The message `id` (UUID) is a natural dedup key. No need for complex optimistic UI reconciliation — the subscription is the source of truth for new arrivals, and the initial fetch handles history.

**Alternative considered**: Replace entire message array from subscription. Would work but causes flicker and loses scroll position.

### 3. Optimistic UI for admin replies and student sends

**Decision**: Keep the existing pattern — after `POST /api/admin/messages` or `POST /api/messages` succeeds, prepend the returned message to local state immediately. The subscription will also fire the same INSERT event; dedup by ID.

**Why**: The existing code already does this for the sender. Keeping it means the sender sees their message instantly even if the WebSocket has latency. The dedup-by-ID in the subscription handler prevents double-rendering.

### 4. Unread badge live updates

**Decision**: For admin nav badge: the subscription handler increments the unread count when a new student message arrives for a thread not currently being viewed. For student dashboard badge: the subscription handler increments the unread count when a new admin message arrives and the student is not currently viewing Messages.

**Why**: Badges should reflect the current state. If the user is actively viewing the conversation, they're implicitly reading the new messages, so don't bump the badge. This requires knowing which view is active — pass a callback or use a ref.

### 5. Reconnection and error handling

**Decision**: Rely on Supabase Realtime's built-in reconnection. On initial connection failure, fall back to the existing on-demand fetch behavior (no real-time). Add a `subscriptionStatus` state for each component: `'connecting' | 'connected' | 'error'`. Show a subtle indicator only on error.

**Why**: Supabase Realtime handles reconnection with exponential backoff automatically. Custom reconnection logic is unnecessary. The fallback to fetch-on-mount means the feature degrades gracefully — if WebSocket fails, the app still works exactly as it does today.

### 6. Database: REPLICA IDENTITY FULL

**Decision**: Run `ALTER TABLE public.messages REPLICA IDENTITY FULL;` as a one-time DDL migration.

**Why**: Without this, INSERT events only include the new row's columns that are part of the primary key or unique indexes. `REPLICA IDENTITY FULL` ensures the complete row (id, student_id, sender, message_text, created_at, broadcast_id) is included in every change event, so the client doesn't need to re-fetch.

**Risk**: Slight increase in WAL volume for the `messages` table. Mitigation: The messages table is write-light (student messages are cooldown-limited, admin replies are manual). Impact is negligible.

## Risks / Trade-offs

- **WebSocket connection overhead**: Each subscribed client maintains a WebSocket to Supabase. Risk: Scaling to many concurrent users. Mitigation: Supabase Realtime is designed for this; connections are pooled server-side. The app is a single-tenant portal with modest user counts, not a chat app with thousands of concurrent users.
- **Event ordering**: Messages arrive as Postgres commits them, not necessarily in `created_at` order. Risk: A message created slightly later might commit first and appear out of order. Mitigation: Sort by `created_at` on each event merge. Toleration: a one-second ordering discrepancy is acceptable for this use case.
- **Channel cleanup**: If a student switches between dashboard sections, the subscription must be removed and re-created. Risk: Memory leaks from stale subscriptions. Mitigation: `useEffect` cleanup function calls `supabase.removeChannel()` or `.unsubscribe()`. Test with React StrictMode (double-mount/unmount).
