## Why

The student message area lacks loading states, error recovery, read tracking, and branded styling. Timestamps are verbose and nearly invisible on student-sent bubbles. Admin messaging is buried inside Daily Operations and has no presence in the Action Required area, so incoming student messages are easily missed. This change polishes messaging end-to-end: student-facing UI quality, student-side read tracking, and a dedicated admin Messages tab with Action Required visibility.

## What Changes

- **Student message read tracking**: New `student_message_read_state` table tracks when a student last read admin replies. The dashboard summary card shows unread count instead of total message count.
- **Student message UI polish**: Loading and error states, short timestamp format, unread markers on admin messages, character counter, context note about response timing, mobile-friendly height, and fix for nearly-invisible student timestamps.
- **Admin Messages tab**: Extracts message functionality from Daily Ops into a dedicated primary tab (next to Calendar). Preceptor Analytics moves to the hamburger menu to make space.
- **Admin Action Required unread card**: A new item in the Action Required section shows the count of unread student message threads and links to the Messages tab.
- **Tab reorder**: Primary tabs become Daily Operations | Calendar | Messages | Registry | Maintenance & Archive. Preceptor Analytics moves to secondary hamburger menu.

## Capabilities

### New Capabilities
- `student-message-read-tracking`: Track when a student last read admin messages and display unread count on the dashboard summary card.

### Modified Capabilities
- `admin-command-center`: Primary tabs reorder (add Messages, move Preceptor Analytics to hamburger). Action Required card gains an unread-messages item.
- `student-dashboard`: Message summary card shows unread admin message count instead of total message count.
- `admin-message-inbox`: Unread indicators now also appear in the Action Required card (not only in the removed Student Messages section).

## Impact

- **Database**: New `student_message_read_state` table (migration). RLS policies. Regenerate TypeScript types.
- **API**: New `POST /api/messages/mark-read` endpoint for students.
- **Student components**: `src/components/dashboard/messages.tsx` (major), `src/app/dashboard/page.tsx` (summary card query).
- **Admin components**: `src/components/admin/daily-ops.tsx` (remove message section, add Action Required card), `src/components/admin/admin-navigation.tsx` (tab reorder), `src/app/admin/page.tsx` (new tab).
- **New admin component**: `src/components/admin/messages-page.tsx` (extracted message UI).
- **Specs updated**: `admin-command-center`, `student-dashboard`, `admin-message-inbox`.
