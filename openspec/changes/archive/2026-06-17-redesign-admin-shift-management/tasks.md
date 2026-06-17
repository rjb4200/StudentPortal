## 1. Database Migration

- [x] 1.1 Create migration file `supabase/migrations/<next-number>_add_cancelled_by.sql` to add `cancelled_by TEXT` column to `schedules` table
- [x] 1.2 Apply migration to live Supabase project via `supabase_apply_migration`
- [x] 1.3 Regenerate TypeScript types via `supabase_generate_typescript_types` and replace `src/lib/supabase/database.types.ts`

## 2. API Changes

- [x] 2.1 Update `POST /api/schedule/cancel` — conditionally set `cancelled_by = 'student'` when cancelling an approved shift; leave null for pending cancellations
- [x] 2.2 Update `POST /api/admin/schedule-action` — set `cancelled_by = 'admin'` when `action === 'cancelled'`

## 3. New ShiftManagement Component

- [x] 3.1 Create `src/components/admin/shift-management.tsx` with tabbed table (Approved/Cancelled/Rejected/All tabs with counts), date range filter, student dropdown filter, and Cancel button on approved rows
- [x] 3.2 Implement status badge rendering per row (color-coded: crimson for Approved, amber for Cancelled, gray for Rejected)
- [x] 3.3 Implement cancelled-by display: show "(by student)" or "(by admin)" on cancelled rows

## 4. Restructure DailyOps Component

- [x] 4.1 Remove `tickerEvents` state, evaluation fetch from `loadAll()`, and Recent Activity card (lines 38, 59-66, 74-80, 96-99, 219-222, 443-459)
- [x] 4.2 Remove `welcomePreview` state, welcome message fetch from `loadAll()`, and Welcome Message card (lines 44, 67, 81-83, 461-480)
- [x] 4.3 Split `filteredSchedules` into `pendingSchedules` (status === 'pending') and `cancelRequests` (status === 'cancelled' AND cancelled_by === 'student')
- [x] 4.4 Add Cancel Request rendering block to Action Required feed: amber badge "Cancel Req", student name, date, time, cancel note, amber "Cancel Shift" button
- [x] 4.5 Update approved schedule rendering: remove from Action Required feed entirely
- [x] 4.6 Update badge counter `totalActions` to include cancel requests count
- [x] 4.7 Add ShiftManagement component below Student Roster card, passing `schedules`, `students`, and cancel handler as props

## 5. Verification

- [x] 5.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 5.2 Verify student cancels pending shift: status changes to cancelled, no appearance in Action Required feed
- [x] 5.3 Verify student cancels approved shift: appears in Action Required feed with Cancel Req badge
- [x] 5.4 Verify admin clicks "Cancel Shift" on cancel request: item disappears from feed, appears in Shift Management Cancelled tab as "(by admin)"
- [x] 5.5 Verify admin cancels approved shift from Shift Management: status changes, appears in Cancelled tab as "(by admin)"
- [x] 5.6 Verify Shift Management tabs filter correctly: Approved shows only approved, Cancelled shows only cancelled, Rejected shows only rejected, All shows everything
- [x] 5.7 Verify date range and student filters work correctly in Shift Management
- [x] 5.8 Verify Recent Activity and Welcome Message cards no longer appear in Daily Operations
