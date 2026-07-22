## Context

The student lifecycle currently has no formal denial path. A pending student can only be approved (status → `certified`) or deleted. The approval UI in `daily-ops.tsx` shows a direct "Approve" button with no confirmation; deletion uses the `ConfirmDialog` pattern. Registry records (sites, instructors, classes) and schedule records both already use `rejected` as a first-class status, providing a proven pattern.

The `students` table uses a `student_status` enum: `('pending', 'certified', 'expired', 'archived')`. The middleware (`src/middleware.ts:74`) has a catch-all that blocks any status other than `certified` or `pending` from dashboard access. Email templates in `src/lib/email-templates.ts` follow a consistent WFD-branded pattern using `escHtml`, `buildEmailHtml`, and centralized brand constants.

## Goals / Non-Goals

**Goals:**
- Provide a server-side API route (`POST /api/admin/reject-student`) that mirrors the approve-student route's auth, validation, and error-handling patterns
- Require a non-empty rejection reason and store it alongside timestamp and admin identity
- Delete the associated Supabase Auth user so the student can re-register cleanly
- Send three non-blocking notification emails: student (with reason), class instructor (with reason), admin(s) (with full contact info)
- Guard the UI action with a confirmation dialog containing a required reason text input
- Block rejected students from dashboard access (already handled by middleware catch-all)

**Non-Goals:**
- Reversible rejection (no "un-reject" action)
- Reapply detection (no cross-record tracking of prior rejections)
- Capturing rejection reason via dropdown; free-text only
- Email to all admins (single admin notification to the rejecting admin, matching the approve-student pattern)
- A `rejections` audit log table (rejection metadata lives on the `students` row)

## Decisions

### 1. Add `rejected` to `student_status` enum rather than reuse `archived`

**Rationale**: `archived` is already used for post-certification archival. The registry and schedule domains both use `rejected` as their own first-class status. Semantic clarity and consistency with existing patterns. Adding to a Postgres enum is safe (no table rewrite) but must be done in a migration before any column that references the type.

**Alternative considered**: Adding a `rejection_reason` column to `students` and setting `status = 'archived'`. Rejected because it overloads `archived` and loses the distinction between "rejected at review" and "archived after certification."

### 2. Delete the auth user on rejection

**Rationale**: The user explicitly wants this. The `auth_user_id` FK has `ON DELETE SET NULL`, so the column auto-clears. This lets the student re-register with the same email since the partial unique index only covers `WHERE status IN ('pending','certified')`. If auth deletion fails, the entire rejection is rolled back (no status change).

**Alternative considered**: Keeping the auth user (blocked by middleware). Rejected because the user explicitly chose deletion.

### 3. Confirmation dialog with embedded required reason field (custom Modal, not ConfirmDialog)

**Rationale**: The existing `ConfirmDialog` component (`src/components/ui/operational.tsx:52`) only supports title + description text + cancel/confirm buttons. For a required text input, we need a different approach. The `Modal` component (`src/components/ui/modal.tsx`) supports arbitrary `children`, making it suitable for a rejection form.

**Implementation**: A new `RejectStudentDialog` component (inline in daily-ops.tsx or as a separate file) that renders inside a `Modal` with:
- Title: "Reject [Student Name]?"
- Description text explaining consequences
- A `<textarea>` bound to local state with required validation
- Cancel and "Reject Student" (danger variant, disabled when reason is empty) buttons

**Alternative considered**: Extending `ConfirmDialog` to accept an optional input. Rejected because it complicates a simple shared component for a single use case.

### 4. Admin notification email to the rejecting admin only

**Rationale**: The approve-student route sends email to the student only, not to admins. The onboarding-complete notification sends to the admin looking at the queue. The shift-cancellation student notification does query "all active admins" for its admin email, but there's no existing pattern in the student approval flow for broadcasting to all admins. Sending to the single approving/rejecting admin is consistent with the approval path and avoids the complexity of querying the `admin_accounts` table or `auth.users` `app_metadata`.

**Alternative considered**: Query all users where `raw_app_meta_data->>'role' = 'admin'`. Rejected to keep scope tight and consistent with approve.

### 5. Non-blocking email delivery (same as approve-student)

**Rationale**: The approve-student route wraps email in a silent try/catch. The rejection API follows the same pattern: status update succeeds regardless of email outcome. Email failures are logged to console.

### 6. Database migration: ALTER TYPE + ALTER TABLE in a single migration

**Rationale**: The enum addition and column additions are tightly coupled — the columns are meaningless without the enum value, and the API code references both. A single numbered migration file in `supabase/migrations/` keeps them atomic.

```sql
ALTER TYPE student_status ADD VALUE 'rejected';

ALTER TABLE students
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN rejected_at      TIMESTAMPTZ,
  ADD COLUMN rejected_by      TEXT;
```

All three new columns are nullable. `rejection_reason` is validated as non-empty at the API layer, not via a DB constraint (allows legacy rows with NULL).

### 7. API route structure mirrors approve-student

The rejection route follows the exact same pattern as `src/app/api/admin/approve-student/route.ts`:
- Same auth check (cookie-based server client → `canAccessAdmin`)
- Same `adminClient` for the update (service role bypasses RLS)
- Same JSON body parsing and guard clauses
- Same non-blocking email pattern
- Same `{ success: true }` response shape

The key differences: additional column updates (`rejection_reason`, `rejected_at`, `rejected_by`), auth user deletion before student update, three emails instead of one, and a richer student lookup (needs class/instructor data for emails).

## Risks / Trade-offs

- **Auth user deletion fails but student record doesn't** → The student row update is guarded behind successful auth deletion. If auth delete fails, the API returns an error and the student remains pending. No partial state.
- **Enum migration on a live table** → `ALTER TYPE ... ADD VALUE` is safe (no table scan, no lock beyond catalog). The column additions are also safe (nullable, no default that requires a table rewrite).
- **Rejected student tries to log in** → Middleware catch-all already redirects non-`certified`, non-`pending` statuses. No change needed.
- **TypeScript types drift** → After migration, `database.types.ts` must be regenerated. The existing `student_status` type definition will need the new value and columns added.
- **Instructor email unavailable** → Some students (legacy, no class link) won't have an instructor email. The API queries `training_classes(instructors(email))` and skips the instructor email if not found. Same pattern as `registry-status` route.
