## Context

The admin Daily Operations panel (`src/components/admin/daily-ops.tsx`, 534 lines) currently mixes triage items (pending students, schedules, quiz flags) with passive information (Recent Activity, Welcome Message preview). The Action Required feed includes approved schedules alongside actionable pending ones, and student-initiated cancellations are invisible — they only surface via email. The component has accumulated concerns and needs restructuring.

Key constraints:
- Existing tech stack: Next.js 15 (App Router), React 18, Tailwind CSS 3, Supabase
- Three Supabase client patterns in use: browser client (anon), server client (cookies), admin client (service role)
- All tables have RLS enabled
- UI components exist: Card, Button, Badge, Modal, Input from `src/components/ui/`
- Custom `wfd-*` color palette: crimson (#B61C20), charcoal (#1C1C1E), gold (#D4AF37), sage

## Goals / Non-Goals

**Goals:**
- Surface student-initiated cancellations of approved shifts in the Action Required feed
- Move approved schedule management to a dedicated Shift Management section
- Remove low-value cards (Recent Activity, Welcome Message preview)
- Visually differentiate Action Required item types by badge color and button style
- Add `cancelled_by` tracking to the schedules table
- Keep pending shift cancellations invisible to admins (self-service, no action needed)

**Non-Goals:**
- Changing the student-side cancellation flow or CancelShiftModal UI
- Modifying email notification behavior
- Changing quiz flag behavior, student roster, or messaging system
- Adding a calendar view to Shift Management (table only)
- Changing the Preceptor Analytics or Maintenance & Archive tabs

## Decisions

### 1. `cancelled_by` as nullable TEXT column

**Decision**: Add `cancelled_by TEXT NULL` to the `schedules` table. Values: `'student'` or `'admin'`. Null for non-cancelled schedules and student-cancelled pending shifts.

**Alternatives considered**:
- *ENUM*: Would require a custom PostgreSQL type + migration complexity. TEXT with application-level validation is simpler and matches existing patterns in this codebase.
- *Boolean `student_cancelled`*: Less expressive — can't distinguish admin vs student. TEXT allows future values if needed.
- *No new column, just check `cancel_note` for presence*: Unreliable since both student and admin can set notes. Doesn't distinguish intent.

**Rationale**: The Action Required feed needs a reliable filter: `status = 'cancelled' AND cancelled_by = 'student'`. This directly selects student-initiated cancellations of approved shifts (pending cancellations leave `cancelled_by` null). When an admin processes the cancellation, updating `cancelled_by` to `'admin'` naturally removes it from the feed filter — no separate acknowledged flag needed.

### 2. New `ShiftManagement` component

**Decision**: Extract shift management into `src/components/admin/shift-management.tsx` as a standalone client component that receives `schedules` and `students` arrays as props.

**Props interface**:
```typescript
interface ShiftManagementProps {
  schedules: ScheduleRow[]   // all schedules with joined student info
  students: StudentRow[]     // for the student filter dropdown
  onCancel: (scheduleId: string, note?: string) => Promise<void>
}
```

**Internal state**: `activeTab` ('approved' | 'cancelled' | 'rejected' | 'all'), `dateFrom`, `dateTo`, `selectedStudentId`. Filtering is client-side from the passed-in data.

**Rationale**: `daily-ops.tsx` is already 534 lines. Adding a tabbed filterable table inline would push it past 650+. The new component encapsulates its own tab state, filter state, and rendering logic. The parent (`daily-ops.tsx`) retains the single `schedules` fetch and passes data down — no duplicate Supabase queries.

### 3. Action Required feed restructuring

**Decision**: Split the current single `filteredSchedules` into two filters:
- `actionRequiredSchedules`: `status = 'pending'` (for Approve/Reject buttons)
- `cancelRequests`: `status = 'cancelled' AND cancelled_by = 'student'` (for Cancel Shift button)

Each gets its own rendering block with distinct badge colors and button styles.

**Visual scheme**:

| Item | Badge bg | Badge text color | Badge label | Button style |
|---|---|---|---|---|
| Pending student | `bg-wfd-sage/10` | `text-wfd-sage` | Approval | Crimson Button |
| Pending schedule | `bg-blue-100` | `text-blue-700` | Schedule | Crimson Button + danger Reject |
| Cancel request | `bg-amber-100` | `text-amber-700` | Cancel Req | Amber/warning Button |
| Quiz flag | `bg-amber-100` | `text-amber-700` | Flag | Secondary Button (existing) |

**Rationale**: The user explicitly requested that items "don't look the same." Four distinct color combinations + different button labels/colors make the feed scannable at a glance. Cancel requests use amber (warning/distinct from both sage approval and blue schedule) with a matching amber button to signal "this is different from approve/reject."

### 4. API changes — minimal, backward compatible

**Decision**: Modify two existing API routes without creating new endpoints.

`POST /api/schedule/cancel` (student cancel):
- Before updating status, check `schedule.status`
- If `schedule.status === 'approved'`: include `cancelled_by: 'student'` in the update
- If `schedule.status === 'pending'`: update status only, no `cancelled_by`

`POST /api/admin/schedule-action` (admin cancel):
- When `action === 'cancelled'`: include `cancelled_by: 'admin'` in the update (previously only set status + note)

**Rationale**: No new API routes needed. The `cancelled_by` field is additive — existing callers work unchanged. The student cancel route already checks `schedule.status` before updating (line 88 of cancel route), so the conditional is a natural extension.

### 5. State cleanup in DailyOps

**Removed state and effects**:
- `tickerEvents` state + evaluation fetch from `loadAll()` + manual append in `handleApprove`/`handleAcknowledgeFlag`
- `welcomePreview` state + welcome message fetch from `loadAll()`
- `filteredSchedules` combined pending+approved filter — split into `actionRequiredSchedules` and `cancelRequests`

**Simplified `loadAll`**: Remove `recentEvals` and `welcomeMsg` from the parallel `Promise.all` — down from 6 queries to 4.

### 6. Admin "processes" student cancellation

**Decision**: When an admin clicks "Cancel Shift" on a student-initiated cancellation in the Action Required feed, call `POST /api/admin/schedule-action` with `action: 'cancelled'`. This sets `cancelled_by = 'admin'`, which removes it from the feed filter. The schedule stays visible in Shift Management under Cancelled.

**Rationale**: Reusing the existing admin schedule-action endpoint avoids creating a separate "acknowledge" endpoint. The `cancelled_by` field serves double duty — it tracks who cancelled AND whether the cancellation has been processed by an admin (when student-initiated gets overwritten to admin). This is simpler than adding a separate `acknowledged_at` field.

## Risks / Trade-offs

- **[Risk] `cancelled_by` overwritten on admin processing**: When admin clicks "Cancel Shift" on a student cancellation, `cancelled_by` changes from `'student'` to `'admin'`, losing the original student-initiated distinction. **Mitigation**: The Shift Management Cancelled tab shows the cancel note written by the student, so the original context is preserved. If we later need to know original initiator, we can add `original_cancelled_by` — but that's not a current requirement.

- **[Risk] Migration ordering**: The new `cancelled_by` column must be applied to the live Supabase project before the API code changes deploy. **Mitigation**: The column is nullable with no default constraint — existing rows work fine. API code is backward-compatible (it includes `cancelled_by` in the update, which Supabase ignores if the column doesn't exist yet). Deploy migration first, then code.

- **[Risk] `daily-ops.tsx` still large after refactor**: Even with Shift Management extracted, the file remains ~500 lines due to Action Required feed, Student Roster, Messaging, and Broadcast. **Mitigation**: Acceptable for now. The feed restructuring is straightforward — it replaces one combined block with three separate blocks. Future refactors can further split the roster or messaging if needed.

## Migration Plan

1. Run Supabase migration to add `cancelled_by TEXT` column to `schedules` table
2. Regenerate TypeScript types via `supabase_generate_typescript_types` and update `database.types.ts`
3. Deploy API changes (both cancel endpoints — backward compatible)
4. Deploy frontend changes (new daily-ops.tsx feed logic + new ShiftManagement component)
5. Verify: student cancels approved shift → appears in Action Required; admin processes → disappears; Shift Management shows all status tabs

**Rollback**: Revert frontend code, remove `cancelled_by` references from API routes. The column can stay (nullable, no impact on existing queries).

## Open Questions

- Should the Shift Management table support pagination if many schedules accumulate? (Current assumption: client-side filtering is sufficient for typical volumes; can add server-side pagination later.)
