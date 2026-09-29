## Context

Supabase Realtime supports three channel types: `postgres_changes` (database change events, already in use), `broadcast` (arbitrary client-to-client messages), and `presence` (shared state). For typing indicators, `broadcast` is the right fit — it's ephemeral, requires no database writes, and delivers messages to all channel subscribers. The WebSocket connection is already established by the existing `postgres_changes` subscriptions.

## Goals / Non-Goals

**Goals:**
- Student sees "Staff is typing..." when an admin is composing a reply in their conversation
- Admin sees "{Student Name} is typing..." when the student is composing a message
- Indicator clears after 3 seconds of inactivity (debounced)

**Non-Goals:**
- Typing indicator in broadcast compose modal
- Presence / online status
- Multi-party chat rooms (conversations are 1:1 student↔all admins)

## Decisions

### 1. Channel scope: one broadcast channel per conversation

**Decision**: A single Broadcast channel per conversation: `typing:{studentId}`. Student subscribes and broadcasts on this channel. Admins subscribe when viewing a conversation.

**Why**: Conversations are 1:1 (one student, all admins). A per-student channel ensures typing events are scoped — admins only see typing for the conversation they're viewing, not a global firehose.

**Alternatives considered**: One global `typing` channel with a `studentId` field in the payload. Simpler but every subscribed client receives every typing event and must filter. Per-conversation channels are cleaner.

### 2. Payload format

**Decision**:
```ts
{ type: 'typing' | 'idle', sender: 'student' | 'admin', studentId: string }
```

**Why**: The `sender` field lets the receiving side determine whether to show the indicator (don't show your own typing). `type: 'idle'` is sent once after 3s debounce timeout to proactively clear.

### 3. Debounce and timeout

**Decision**: On each keystroke (or every 500ms), broadcast `{ type: 'typing' }`. A 3-second timeout resets on each event. When the timeout fires, broadcast `{ type: 'idle' }` and stop. The receiving side also runs a local 4-second timeout to clear the indicator if no typing event is received (safety net for network drops).

**Why**: 500ms debounce prevents flooding the channel. 3s timeout before idle balances responsiveness with avoiding flicker. 4s receiving timeout handles edge cases where the idle event is lost.

### 4. Broadcasts excluded

**Decision**: The broadcast compose modal does NOT subscribe to or emit typing events. Conversation-scoped only.

**Why**: Broadcasts are one-to-many announcements, not conversations. A typing indicator there would be confusing (typing to... who?). Simple scope boundary.

## Risks / Trade-offs

- **Broadcast reliability**: Broadcast messages are fire-and-forget (no ack). Risk: lost typing event means indicator clears on the receiving timeout. Mitigation: 4s receiving timeout handles this gracefully. Impact is cosmetic.
- **Channel cleanup**: Each conversation switch creates a new Broadcast channel. Risk: stale channels if cleanup fails. Mitigation: `useEffect` return cleans up channels on unmount/studentId change, same pattern as existing `postgres_changes` subscriptions.
