## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- Instructor registration Step 4 (`src/app/instructor-registration/page.tsx`) disables submit until a typed signature matches the representative name.
- `POST /api/instructor/register` (`src/app/api/instructor/register/route.ts`) always inserts a `class_mous` row and emails admins when the insert succeeds. It already tolerates a failed MOU insert (logs and continues), so the backend does not hard-require an MOU.
- `class_mous.training_class_id` is `UNIQUE`; `class_mous` is treated by the schema and UI as "a signed MOU".
- The admin Action Required card (`src/components/admin/daily-ops.tsx`) aggregates typed items and already has an acknowledge pattern for `quiz_flags` (`handleAcknowledgeFlag` → `/api/admin/acknowledge-quiz-flag`).
- The Daily Ops pending-MOU query excludes empty signatures (`.not('representative_signature', 'eq', '')`), so skip rows will not collide with that list.
- RLS: admin writes go through the service-role client in API routes; admin-only tables use `app_metadata.role = 'admin'` policies.

## Goals / Non-Goals

**Goals:**
- Allow an acknowledged skip of the portal MOU at instructor registration.
- Record skips durably and separately from signed MOUs.
- Give admins a dismissible, auditable "No MOU" Action Required item.
- Keep the change additive and low-risk: no student-facing behavior changes.

**Non-Goals:**
- Hard-gating students, scheduling, or class approval on the presence of a MOU.
- Verifying an off-platform MOU in the portal.
- Backfilling or converting a skip into a signed MOU on-site.
- Email notifications for skips.

## Decisions

### Separate `class_mou_skips` table (not columns on `class_mous`)
`class_mous` keeps its meaning ("a signed MOU", one row per class). A skip is a different fact with its own lifecycle (acknowledgment + admin dismissal), so it gets its own table, mirroring `quiz_flags`.

Proposed shape:

| column | type | notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `training_class_id` | uuid fk → `training_classes(id)` | `UNIQUE`, `ON DELETE CASCADE` |
| `reason` | text | check in (`existing_mou`, `will_execute_separately`) |
| `organization_name` | text | snapshot at skip time |
| `acknowledged_name` | text | representative who acknowledged |
| `acknowledged_at` | timestamptz | `now()` default |
| `dismissed_at` | timestamptz null | admin dismissal |
| `dismissed_by` | uuid null fk → `admin_accounts(id)` | `ON DELETE SET NULL` |
| `created_at` / `updated_at` | timestamptz | `now()` |

RLS: enabled, admin-only `FOR ALL` policy using `app_metadata.role = 'admin'` (same pattern as `class_mous`).

Alternative considered: skip columns on `class_mous`. Rejected — it makes the table hold non-MOUs, forces every existing MOU query to reason about skip state, and diverges from the established acknowledged-flag pattern.

### Validation: discriminated union on `mou`
Replace the required `mouSchema` in `instructorRegistrationBody` with a union:

- `{ mode: 'signed', ...mouSchema }`
- `{ mode: 'skipped', reason: z.enum(['existing_mou','will_execute_separately']), acknowledgedName: nameSchema }`

The existing signature flow is unchanged apart from carrying `mode: 'signed'`.

### Skip inserts only `class_mou_skips`
When `mou.mode === 'skipped'`, the route inserts a `class_mou_skips` row and does **not** insert `class_mous` and does **not** call the awaiting-signature email. The signed path is unchanged. Registration remains resilient: a skip-insert failure is logged and does not fail registration (matching today's MOU tolerance).

### Admin dismissal as a dedicated endpoint
Add `POST /api/admin/acknowledge-mou-skip` (admin-authenticated, Zod-validated `{ skipId }`) that sets `dismissed_at = now()` and `dismissed_by = <admin_accounts.id>`, mirroring `acknowledge-quiz-flag`. This records who dismissed, satisfying the audit requirement.

Alternative considered: plain boolean `acknowledged`. Rejected per the requirement to record `dismissed_by`.

### De-emphasized skip UI
Step 4 presents signature + submit as primary. A small muted text link ("Skip MOU — we already have or will execute one separately") reveals an inline acknowledgment panel: two radio reasons, a required confirmation checkbox ("I understand a MOU is required for students to ride"), and a secondary "Submit without signing" action. Submit is blocked until a reason is selected and the checkbox is checked.

### Emails and copy
No email is sent on skip. The post-submit confirmation copy branches: signed → current text; skipped → states the class was registered without a portal MOU and that the organization acknowledged the off-platform MOU requirement.

## Risks / Trade-offs

- **Skip becomes the default path** → Keep it visually muted, require an explicit reason and confirmation checkbox, and surface it to admins until dismissed.
- **Skip-insert failure with no `class_mous` row** → Admins would see neither a pending MOU nor a No MOU item. Mitigation: log the failure as today; the class still registers, and registry review remains the backstop.
- **Two-table lookups for class MOU state** → Any future "MOU status" view must consider both `class_mous` and `class_mou_skips`. Acceptable now since no such unified view exists.
- **`dismissed_by` FK set null on admin deletion** → Dismissal timestamp is retained even if the admin is removed; audit degrades gracefully.
- **RLS on a new table** → Must mirror the admin policy and be applied live per `AGENTS.md`.

## Migration Plan

1. Add migration creating `class_mou_skips` with constraints + RLS admin policy; apply live in the Supabase dashboard.
2. Regenerate/update `src/lib/supabase/database.types.ts`.
3. Ship validation, route, UI, and admin endpoint changes.
4. Rollback: drop `class_mou_skips` and revert code; signed-MOU behavior is untouched, so rollback has no data-loss impact on existing MOUs.

## Open Questions

None — all key decisions were resolved during exploration.
