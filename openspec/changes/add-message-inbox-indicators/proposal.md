## Why

Daily Operations provides a student conversation list, but every thread appears identical. Staff cannot see whether a student has sent a message they have not reviewed or which conversations still need a response, so time-sensitive communication can be missed.

## What Changes

- Add an in-app message inbox state for each admin and student conversation.
- Mark student-originated messages unread for each eligible admin until that admin opens the conversation.
- Show a visible unread count and per-thread unread indicator in Student Messages.
- Surface the latest message preview, timestamp, and a needs-reply cue when the latest message is from the student.
- Prioritize unread conversations in the Student Messages list while keeping all student threads available.
- Preserve read state independently for each admin account.

## Capabilities

### New Capabilities
- `admin-message-inbox`: Per-admin unread state and visual conversation-triage indicators in Daily Operations.

### Modified Capabilities
- None.

## Impact

- Affected UI: `src/components/admin/daily-ops.tsx` and admin navigation or summary surfaces that expose the unread count.
- Affected data: a new per-admin, per-student conversation read-state record and supporting access controls.
- Affected tests: message-list ordering, visual state derivation, read-state isolation, and read acknowledgement behavior.
- This builds on the active `harden-student-messaging` change; it does not alter message delivery or email notifications.
