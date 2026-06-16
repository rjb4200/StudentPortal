## Why

The admin Daily Operations tab currently spreads three related cards — Student Approval Queue, Schedule Requests, and Quiz Flags — across separate scrollable containers. Each follows the same pattern (student name + details + action button) but in isolated boxes, forcing the admin to visually scan three separate areas for actionable items. Consolidating them into a single unified "Action Required" list reduces cognitive load and makes the dashboard faster to scan.

## What Changes

- **Merge three cards into one**: Student Approval Queue, Schedule Requests, and Quiz Flags become sections within a single "Action Required" card, with type badges differentiating each item.
- **Type badges**: Each item gets a colored badge (green = Approval, blue = Schedule, amber = Flag) so the admin can scan by type at a glance.
- **Sorted by priority**: Approvals first (blocking), then Schedule Requests (operational), then Quiz Flags (informational). Within each group, newest first.
- **Unified empty state**: One "Nothing requires your attention" message replaces three separate "No pending..." messages.
- **Simplify grid layout**: The unified card spans full width, freeing the right column for other content.

## Capabilities

### New Capabilities
- None — this is a UI reorganization of existing functionality.

### Modified Capabilities
- `admin-command-center`: The approval queue, schedule request management, and quiz flag cards are consolidated into a single unified "Action Required" card. Individual action behaviors (Approve, Approve/Reject, Acknowledge) remain unchanged but are rendered inline with type badges in a shared list.

## Impact

- **Files**: `src/components/admin/daily-ops.tsx` (restructure card rendering — no API or database changes)
- **Database**: None
- **API**: None
- **Dependencies**: None
- **BREAKING**: None — all admin actions remain identical
