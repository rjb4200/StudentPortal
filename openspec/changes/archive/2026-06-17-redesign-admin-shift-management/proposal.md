## Why

The admin Daily Operations panel currently shows low-value information (Recent Activity ticker, Welcome Message preview) while failing to surface student-initiated shift cancellations. Approved and pending schedules are mixed together in a single "Action Required" feed with no dedicated shift management view. Admins have no in-app visibility when a student cancels an approved shift -- they only learn about it via email.

## What Changes

- Add a `cancelled_by` field to the `schedules` table to distinguish student-initiated from admin-initiated cancellations
- Show student-initiated cancellations of approved shifts in the Action Required feed with a distinct visual design and a "Cancel Shift" button to process them
- Remove the Recent Activity card and Welcome Message preview card from the Daily Operations tab
- Create a new Shift Management section (tabbed table: Approved, Cancelled, Rejected, All) with date range and student filters, replacing the removed cards
- Split the current Action Required schedule filter: only pending schedules stay in the feed; approved schedules move to Shift Management
- Visually differentiate all Action Required item types with distinct badge colors and button styles (Approval/sage, Schedule/blue, Cancel Request/amber, Flag/amber)
- Allow student self-service cancellation of pending shifts without it appearing in the admin feed (no admin action needed)

## Capabilities

### New Capabilities
- `admin-shift-management`: Tabbed shift management table (Approved/Cancelled/Rejected/All) with filtering, replacing the removed Recent Activity and Welcome Message cards
- `shift-cancellation-tracking`: `cancelled_by` field on schedules to distinguish who initiated a cancellation, enabling student-initiated cancellations to surface in the Action Required feed

### Modified Capabilities
- `admin-command-center`: Remove Recent Activity card and Welcome Message preview; add cancellation requests to Action Required feed; move approved schedule management out of Action Required
- `scheduling-calendar`: Approved schedules no longer appear in the Action Required feed; they are managed exclusively in the new Shift Management section
- `shift-cancellation`: Student cancellations of approved shifts now set `cancelled_by = 'student'` and appear in the admin Action Required feed; admin cancellations set `cancelled_by = 'admin'`; pending shift cancellations by students do not set `cancelled_by` and do not appear in the feed

## Impact

- Database: migration to add `cancelled_by TEXT` column to `schedules` table
- API: `POST /api/schedule/cancel` — conditionally sets `cancelled_by = 'student'` for approved shifts
- API: `POST /api/admin/schedule-action` — sets `cancelled_by = 'admin'` on admin cancellation
- Component: `src/components/admin/daily-ops.tsx` — major restructuring (remove ~40 lines, add cancellation request display, remove ticker/welcome state)
- Component: `src/components/admin/shift-management.tsx` — new component (tabbed table with filters)
- Types: regenerate `src/lib/supabase/database.types.ts` after migration
