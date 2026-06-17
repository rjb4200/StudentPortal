## Context

The shift lifecycle currently has no cancellation path. Student calendar clicks on existing shifts are silently ignored. Admins can only approve or reject pending shifts. The `schedule_status` enum is limited to `pending`, `approved`, `rejected`. Students have only SELECT and INSERT RLS policies on `schedules`.

## Goals / Non-Goals

**Goals:**
- Let students cancel their own pending and approved shifts with immediate effect
- Let admins cancel any shift with an optional note that appears in the student's email
- Send WFD-branded cancellation emails (to student on cancel, to admins on student-initiated cancel)
- Distinct calendar cell styling for cancelled (orange) vs rejected (gray/strikethrough)

**Non-Goals:**
- Undo a cancellation (once cancelled, stays cancelled)
- Delete or purge cancelled records from the database
- Change RLS policies for admin (admins already have `FOR ALL`)

## Decisions

### Decision 1: New `POST /api/schedule/cancel` route for students

Rather than extending the existing admin-only schedule-action route, create a separate student-facing cancel route. This route authenticates the student via session cookie (same pattern as approve-student route), verifies the schedule belongs to the authenticated student's enrollment, updates status to `'cancelled'`, sends student email, and sends admin notification email.

**Route contract:**
```
POST /api/schedule/cancel
{ scheduleId: string }
→ { success: true }
```

**Why**: Separation of concerns. The admin route checks `canAccessAdmin(user)`; the student route checks `auth.uid() → students.auth_user_id → schedules.student_id`. Mixing both auth patterns in one route adds complexity. A dedicated route also clearly documents the student-facing API surface.

**Alternatives considered**: Combining into one route with role detection — would require branching logic that's harder to audit for security.

### Decision 2: Immediate cancellation, no admin approval

Student cancels take effect immediately — no pending-review state.

**Why**: A student should be able to change their mind about a shift without waiting. The admin notification email keeps staff informed. Making cancellation require admin approval would defeat the purpose (if a student can't make the shift, they need it resolved now, not after an admin reviews it days later).

### Decision 3: Required note for student-approved-shift cancellation

Students cancelling an **approved** shift must provide a reason in a required text field. Students cancelling a **pending** shift need no note.

**Why**: Cancelling an approved shift is a significant action — the student has been scheduled, a preceptor may be assigned, and staffing plans are affected. A required reason ensures accountability and gives admins context in the notification email. Cancelling a pending shift (which was never confirmed) needs no justification.

### Decision 4: `cancel_note` column as text

Store the cancellation note as `text` on the schedules row. Populated by either the student (required for approved shifts) or the admin (optional).

**Why**: Simple, no joins needed. The note is only used for the cancellation email and is never queried independently. No separate notes table needed.

### Decision 4: Distinct colour for cancelled

Calendar cell styling: `bg-amber-100 text-amber-800` (orange/amber) for cancelled, keeping `bg-gray-100 text-gray-400 line-through` for rejected.

**Why**: Students need to visually distinguish "I chose to cancel this" from "the admin rejected my request." Orange suggests active cancellation; gray strikethrough suggests something that didn't happen.

### Decision 5: Admin notification on student cancel

When a student cancels, send an email to all active admins.

**Why**: Keeps staff informed without requiring them to check the dashboard. A student cancelling an approved shift requires the admin to know so they can adjust staffing plans.

## Risks / Trade-offs

- **[Risk] Student cancels approved shift at last minute** → Admin only gets an email, no push notification. Mitigation: The email goes to all active admins. Adding Pushover for student cancellations is a future enhancement.
- **[Risk] RLS policy change opens UPDATE for students** → Students could theoretically update other columns. Mitigation: The new RLS policy's `WITH CHECK` clause restricts the update to only `status = 'cancelled'`, so other columns can't be modified.
