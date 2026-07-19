## Context

The student message area currently lacks loading states, error recovery, and read tracking. Timestamps are verbose (`toLocaleString()`) and the student-sent timestamp uses `text-wfd-crimson/20` which is nearly invisible. Admin messaging is embedded in Daily Operations with no presence in the Action Required area, making incoming student messages easy to overlook.

The existing admin read-tracking infrastructure (`admin_message_thread_state` + `get_admin_message_inbox` RPC) provides a proven cursor-based pattern that can be mirrored for students with a simpler single-row table.

## Goals / Non-Goals

**Goals:**
- Add student-side read tracking with unread count in the dashboard summary card
- Polish student message UI: loading states, short timestamps, unread markers, character counter, context note, mobile-friendly height
- Extract admin messaging to a dedicated Messages tab with proper layout and WFD branding
- Add unread message visibility to the Action Required card
- Reorder admin tabs: Daily | Calendar | Messages | Registry | Maintenance with Preceptor Analytics in hamburger menu

**Non-Goals:**
- Real-time messaging via Supabase Realtime or WebSockets
- Message pagination or infinite scroll
- Read receipts (delivered/seen states beyond the cursor model)
- File attachments or rich text in messages
- Student-side per-message read status (cursor model covers it)
- Auto-refreshing the dashboard unread count without tab re-navigation

## Decisions

### Decision 1: Cursor-based read tracking (mirror admin pattern)

Use a timestamp cursor (`last_read_admin_message_at`) rather than per-message `is_read` booleans.

**Rationale**: The admin side already uses this pattern successfully. A cursor is simpler (one row per student, upsert only) and doesn't require backfilling existing messages with read flags. The RPC for counting unread messages is a simple `WHERE created_at > cursor` comparison.

**Alternatives considered**:
- Per-message `read_by_student` boolean column — requires schema change on `messages`, backfill, and per-message UPDATEs
- In-memory tracking — lost on server restart, doesn't work across serverless instances

### Decision 2: Mark as read on Messages component mount

When the student opens the Messages tab, a `POST /api/messages/mark-read` call upserts the cursor to the latest admin message timestamp. After marking read, a callback notifies the dashboard to refresh the summary card count.

**Rationale**: Matches the admin pattern (mark read on thread open). The Messages tab is the only place students read messages, so mount is the right trigger. Alternative (scroll-to-bottom trigger) is fragile and would fail if the student opens messages but doesn't scroll.

### Decision 3: Extracted Messages component for admin side

Create `src/components/admin/messages-page.tsx` as a standalone component rendering the full messages experience. Extract from daily-ops but redesign the layout: thread list on the left (wider, better visual treatment), message view on the right, no SectionCard wrapper (the full-page tab context provides the frame).

**Rationale**: A dedicated component is cleaner than conditional rendering inside daily-ops. The extracted layout can be designed for the Messages tab's purpose without the constraints of fitting inside a shared grid.

### Decision 4: Preceptor Analytics to hamburger menu

Move Preceptor Analytics from primary tabs to the secondary hamburger menu. This frees a slot for Messages in the primary tab bar.

**Rationale**: Preceptor Analytics is a specialized analytics view used less frequently than messaging (which is a daily operational need). The hamburger menu is the established pattern for secondary admin destinations (Onboarding Setup, Account Management, System Health). The URL `?tab=analytics` remains functional even though the tab is no longer in the primary bar.

### Decision 5: Short timestamp format

Replace `toLocaleString()` with a function that produces:
- Today: `"3:45 PM"`
- Yesterday: `"Yesterday 3:45 PM"`
- This week (Mon-Sat): `"Mon 3:45 PM"`
- Older: `"Jan 19, 3:45 PM"`

A shared `formatMessageTime(date: string): string` utility in the Messages component. Does not need to be a separate module since it's only used in messaging right now.

### Decision 6: Unread visual marker on admin messages (student side)

When the student views messages, admin messages with `created_at > last_read_admin_message_at` show a small crimson dot or "New" badge. This is purely a UI marker — no database change needed, computed client-side by comparing message timestamps against the student's read cursor fetched on mount.

### Decision 7: Fix timestamp opacity

Change `text-wfd-crimson/20` to `text-white/60` for student-sent message timestamps. The `/20` opacity on white background was essentially invisible.

### Decision 8: Mobile height

Change fixed `h-[500px]` to `min-h-[60vh] max-h-[calc(100vh-16rem)]` so messages are usable on mobile without taking the full viewport.

### Decision 9: Action Required unread messages card

Add a single aggregate item (not per-thread) showing the count of unread threads. Clicking "View Messages" navigates to the Messages tab. The item counts as 1 in `totalActions` (not per-thread) to keep the badge stable.

## Risks / Trade-offs

- **[Risk]** Student opens Messages tab but doesn't scroll — messages are marked as read anyway. **Mitigation**: Matches admin behavior and is the simplest correct trigger. Students must open the tab to see messages at all.
- **[Risk]** Unread count on dashboard summary card doesn't update until page refresh or tab re-navigate. **Mitigation**: The Messages component calls back to the dashboard to refresh the count after marking read. The dashboard refreshes on re-navigate anyway.
- **[Risk]** Moving Preceptor Analytics to hamburger may confuse admins who expect it in the primary bar. **Mitigation**: Preceptor Analytics remains URL-addressable. Any existing bookmarks continue to work.
- **[Risk]** New `student_message_read_state` table needs migration on live Supabase. **Mitigation**: Simple DDL (single table, no data migration). Apply via migration file + Supabase SQL editor as per project convention.

## Migration Plan

1. Run migration to create `student_message_read_state` table with RLS
2. Deploy code changes (new API endpoint, UI updates). No data migration needed — the cursor is lazily created on first mark-read.
3. Verify: student sends message, admin replies, student sees unread count on dashboard, count clears after opening Messages tab.
4. Rollback: delete the table and revert code. No data loss in existing `messages` table.
