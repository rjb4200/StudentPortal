## Context

The onboarding quiz was made admin-configurable in the `admin-configurable-onboarding-quiz` change. The remaining onboarding components (registration form, legal agreements, resource library) and the messaging system are still hard-coded. The quiz change established the pattern of admin management via relational Supabase tables, RLS policies, and admin UI sections under Maintenance & Archive. This change extends the same pattern to the remaining onboarding content and adds broadcast/template/welcome-message capabilities to messaging.

## Goals / Non-Goals

**Goals:**
- Store registration form field configuration in Supabase so admins can manage fields without redeploys.
- Store legal agreement documents in Supabase so admins can edit legal text without redeploys.
- Store resource library categories and documents in Supabase so admins can manage downloads without redeploys.
- Add admin message broadcast, reusable templates, and a configurable onboarding welcome message.
- Render all student-facing components from active database configuration.
- Preserve the existing 4-step onboarding sequence (Register → Legal → Resources → Quiz).

**Non-Goals:**
- Reordering or adding/removing onboarding steps. The 4-step sequence is fixed.
- Student-uploaded files in the resource library. Admins provide files; students download only.
- Rich-text editing of legal documents in v1. Plain text with basic formatting is sufficient.
- Automated message triggers (e.g., auto-send on approval). Messages require manual admin action.
- Retroactively updating already-started onboarding sessions. Changes apply to new sessions.

## Decisions

### 1. Separate relational tables for each content domain

Add four table groups:

| Domain | Tables |
|---|---|
| Registration fields | `registration_fields` |
| Legal documents | `legal_documents` |
| Resource library | `resource_categories`, `resource_documents` |
| Messaging | `message_templates`, `broadcasts`, extend `messages` |

**Rationale:** Each domain has different columns, validation, and relationships. Separate tables follow the existing pattern from `quiz_rules`/`quiz_photos` and keep RLS simple.

**Alternative considered:** A generic `app_config` key-value table. This was rejected because structured tables enable typed queries, relational integrity, ordering, and domain-specific validation with standard RLS.

### 2. Full name and email are permanent mandatory registration anchors

The `registration_fields` table allows admins to configure all fields except `full_name` and `email`, which are always required and always present at positions 1 and 2. The students table schema (`full_name`, `email`, `phone`, `school_name`, `instructor_name`, `instructor_contact`) stays unchanged; additional fields store value as JSON or in a separate `student_field_values` table.

**Rationale:** Name and email are the minimum identity for a student record and map directly to the `students` table. Changing them to optional would break the RPC and student identity.

**Alternative considered:** Make every field configurable including name/email. This would make the students schema dynamic and break the existing RPC.

### 3. Additional registration field values stored in `student_field_values`

Custom registration fields (those not mapping to a `students` table column) store values in a `student_field_values` table (student_id, field_id, value). Fields that match `students` columns (phone, school_name, instructor_name, instructor_contact) update the `students` table directly.

**Rationale:** Avoids altering the `students` table schema at runtime while supporting arbitrary custom fields.

### 4. Resource documents support both URL entry and Supabase Storage upload

Admins can enter a file URL (like quiz photos) or upload a file to a Supabase Storage bucket. The `resource_documents.file_url` column stores the resulting URL. The admin UI includes a file upload input in addition to the URL text field.

**Rationale:** URL entry is sufficient for externally hosted documents; Storage upload is convenient for locally authored PDFs. Supporting both avoids forcing one workflow.

### 5. Broadcast messages stored in the existing `messages` table with a `broadcast_id` column

Add a nullable `broadcast_id` UUID column to `messages`. A new `broadcasts` table tracks broadcast metadata (title, body, sent_by, sent_at). When a broadcast is sent, one `messages` row is inserted per certified student, each referencing the same `broadcast_id`. 1:1 messages have `broadcast_id = NULL`.

**Rationale:** Reuses the existing messages table and RLS. Students query messages the same way regardless of origin. The `broadcasts` table enables admin-side broadcast history.

**Alternative considered:** A separate `broadcast_messages` table. This duplicates the messages schema and complicates the student inbox query (would need a UNION).

### 6. Welcome message stored as a single-row config in `message_templates`

The welcome message is a special template with a fixed `template_type = 'welcome'` and an `is_active` flag. The student dashboard fetches it after onboarding completion.

**Rationale:** Templates already have title + body. A welcome message is a template with a constrained type and no manual insertion into student inboxes.

### 7. Admin UI sections follow the quiz-config pattern

Each domain gets a collapsible or card-based section in Maintenance & Archive, using the same UI primitives (Card, Button, Input, textarea). The sections are:
- Registration Fields (under Onboarding Configuration)
- Legal Documents (under Onboarding Configuration)
- Resource Library (under Onboarding Configuration)
- Message Templates & Broadcast (under Daily Operations messaging area)

**Rationale:** Consistency with the quiz-config component. Keeping messaging in Daily Ops makes operational sense; onboarding content stays in Maintenance.

### 8. RLS follows the same pattern as quiz tables

Admins (via `user_metadata.role = 'admin'`) have full access to registration_fields, legal_documents, resource_categories, resource_documents, message_templates, and broadcasts. Anonymous and authenticated users can read active onboarding content. Authenticated students can receive broadcasts and see the welcome message.

**Rationale:** Consistent with existing admin RLS and the quiz tables. Students must read onboarding content before Auth creation.

## Risks / Trade-offs

- **[Risk] `user_metadata`-based admin RLS** → Mitigation: The Supabase security advisor flags this across all tables. A follow-up change should move admin role checks to `app_metadata` or a dedicated admin table. This change follows the existing pattern for consistency.
- **[Risk] Custom registration fields may not appear in admin student roster views** → Mitigation: The student roster table already shows core student fields. Custom field values can be viewed per-student in a detail panel added later.
- **[Risk] File uploads to Supabase Storage may hit size or bandwidth limits** → Mitigation: URL entry is always available as fallback. Storage bucket can be configured with file size limits.
- **[Risk] Broadcasts to large student rosters create many message rows at once** → Mitigation: Broadcasts are sent by admins manually and the student count is expected to be small (dozens, not thousands). A batch insert handles this efficiently.
- **[Risk] Deactivating all registration fields leaves an empty form** → Mitigation: Full name and email are always required and cannot be deactivated. The form always has at least two fields.

## Migration Plan

1. Add `registration_fields`, `legal_documents`, `resource_categories`, `resource_documents`, `message_templates`, and `broadcasts` tables with indexes and RLS policies.
2. Add `broadcast_id` column to `messages` table.
3. Add `student_field_values` table for custom registration field storage.
4. Seed default registration fields, legal documents, and resource library content matching the current hard-coded values.
5. Seed the migration SQL file.
6. Build admin UI sections for each domain.
7. Update student-facing registration form, legal waiver, resource library, and dashboard components to render from database.
8. Add broadcast and template capabilities to the admin messaging UI.
9. Generate TypeScript types.
10. Run production build and verify.

Rollback: The current hard-coded components remain in git history. If any database-backed component fails, revert to hard-coded rendering and leave the new tables unused.

## Open Questions

- Should resource document file uploads go through Next.js API routes (server-side) or direct Supabase Storage uploads (client-side with RLS)?
- Should the welcome message appear on the post-quiz completion screen, the dashboard, or both?
- Should registration field reordering use drag-and-drop or up/down arrow buttons?
