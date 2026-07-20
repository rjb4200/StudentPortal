## Why

The real-time messaging system now delivers messages instantly in both directions, but neither party can tell when the other is composing a reply. Adding a typing indicator makes the conversation feel alive and reduces uncertainty — the student knows staff is responding, and admins know the student is engaged. The Supabase Realtime WebSocket connection already exists from the messaging-realtime change; this reuses the same transport layer via Broadcast channels with zero database changes.

## What Changes

- **Student typing indicator**: When the student types in the Messages input on the dashboard, a debounced broadcast event fires over the existing Supabase Realtime WebSocket. After 3 seconds of inactivity, an idle event clears the indicator.
- **Admin typing indicator**: When an admin types a reply in the Messages tab (or DailyOps conversation view), the same broadcast mechanism fires. Both sides see a subtle "X is typing..." text below the message list.
- **Broadcasts excluded**: The typing indicator is conversation-scoped only. Broadcast compose modal does NOT emit typing events.
- **No database changes**: Typing state is purely ephemeral — delivered via Realtime Broadcast, never persisted.

## Capabilities

### New Capabilities
- `typing-indicator`: Real-time typing awareness in student↔admin conversations using Supabase Realtime Broadcast channels.

### Modified Capabilities
- `messaging-realtime`: Extends the real-time subscription layer to include a Broadcast channel for typing events in addition to existing `postgres_changes` channels for message delivery.

## Impact

- **New dependency**: None. Supabase Realtime Broadcast is part of the existing `@supabase/supabase-js@2.110.7` client already in use.
- **Library**: New hook `src/lib/use-typing-indicator.ts` encapsulating debounce + broadcast + timeout logic.
- **Components**: `dashboard/messages.tsx` (student emit), `admin/messages-page.tsx` (admin emit + display), `admin/daily-ops.tsx` (admin emit + display).
- **API routes**: None.
- **Database**: None.
