## Context

The current Maintenance & Archive tab is implemented primarily in `src/components/admin/maintenance-archive.tsx`. It combines master export, abandoned-registration deletion, bulk purge, and aggregate calendar-feed copying in one stack of cards. Export and purge currently run from the browser client; purge is a sequence of direct Supabase deletes guarded by native `confirm()` dialogs and an export-completed flag. Abandoned-registration deletion calls the server-side safe student deletion API, but that API accepts only `studentId` and does not capture an admin reason.

The existing `audit_log` table stores only `action`, `performed_by`, and `timestamp`. This is enough for basic logging, but not enough for structured reason/count/status metadata unless the data is embedded in the action string. The redesign needs to improve the safety envelope without destabilizing the existing admin flows.

## Goals / Non-Goals

**Goals:**

- Separate Maintenance & Archive workflows by risk: export, archive cleanup, purge, calendar feeds, and audit visibility.
- Move destructive workflows into a clearly labeled danger zone away from routine operations.
- Add dry-run context before destructive purge actions, including impacted record counts and preserved record categories.
- Require typed confirmation and admin reason fields for purge and abandoned-registration deletion.
- Add visible progress/status feedback for export, purge, and deletion operations.
- Surface recent audit activity or audit links from the maintenance interface.
- Align visual treatment with WFD branding: crimson for authority/destructive actions, gold for caution, sage for safe/completed states, charcoal for command framing, formal serif headings where appropriate.

**Non-Goals:**

- Redesign the full admin command center outside the Maintenance & Archive surface.
- Change student onboarding, dashboard access, approval, or scheduling behavior.
- Replace Supabase Auth or the existing admin role-check model.
- Implement long-running background jobs unless the existing operation duration proves it is required.
- Tokenize or redesign calendar feeds unless explicitly accepted as a follow-up; this change frames calendar-feed sensitivity and improves feedback.

## Decisions

### Use Server-Side Admin Maintenance Actions for Destructive Operations

Purge dry-run and purge execution should move behind admin-only API routes using the server/admin client. This avoids browser-side multi-table deletion logic and gives one place to validate confirmation text, reason, export prerequisite state, count impacted rows, and write audit entries.

Alternative considered: keep purge client-side and improve the UI only. This is faster but leaves the riskiest behavior distributed across browser code and makes reliable audit logging harder.

### Treat Dry-Run as a Required Step Before Purge

The purge UI should fetch a dry-run summary before enabling final confirmation. The summary should include counts for students, schedules, evaluations, messages, and admin notes that would be deleted, plus categories intentionally preserved such as preceptors, audit logs, instructors, sites, and classes.

Alternative considered: show static explanatory text. Static text is useful but does not prove what will happen to the current dataset.

### Capture Reasons for High-Risk Actions

Purge and abandoned-registration deletion should require a non-empty reason in addition to typed confirmation. The reason should be sent to the server and included in the audit entry. If the audit schema remains unchanged, encode the reason and counts in the action text. If a migration is acceptable, prefer structured audit metadata in a follow-up or within this change.

Alternative considered: typed confirmation only. Typed confirmation proves intent but does not explain why the action was taken.

### Use Typed Confirmation Instead of Native Confirm Dialogs

Replace native `confirm()` prompts with in-page or modal confirmation panels that show identity, impact, irreversible nature, reason field, and expected typed phrase. Suggested phrases: `PURGE STUDENT DATA` for bulk purge and the student's email address or `DELETE` for abandoned-registration deletion.

Alternative considered: keep two native confirmation dialogs. Native dialogs are disruptive, inaccessible to style, and cannot include structured reason input.

### Keep Export Lightweight Unless Server Export Becomes Necessary

The existing client-side master export can be retained if it reliably exports the needed tables and displays progress/status. A server endpoint is preferable if export permissions, table scope, or consistency become concerns, but the immediate safety problem is destructive actions rather than export transport.

Alternative considered: require server-generated export before any UI changes. This is cleaner architecturally but broadens the issue.

### Surface Audit Visibility Without Building a Full Audit Console

The Maintenance & Archive page should show recent audit entries relevant to maintenance actions or provide a clear link/section for recent actions. A compact recent-activity card is enough for this issue.

Alternative considered: build a full filterable audit log admin page. Useful, but likely larger than needed for issue #69.

## Risks / Trade-offs

- Schema expansion risk -> If `audit_log` is extended, a Supabase migration and generated TypeScript types are required. Mitigation: either keep reason/count data in action text for this change or explicitly include the migration and type update tasks.
- Partial purge risk -> Multi-table deletion can fail mid-operation. Mitigation: run purge server-side, order deletes intentionally, report failures clearly, and audit attempted/completed status.
- False safety risk -> A UI-only dry-run may not match actual execution. Mitigation: compute dry-run counts server-side using the same table scope as execution.
- Calendar feed sensitivity risk -> The existing aggregate feed is public by path. Mitigation: label it as sensitive operational schedule data and consider tokenization as a separate follow-up if needed.
- Admin friction risk -> Typed confirmations and reason fields slow routine cleanup. Mitigation: apply the strongest friction only to destructive actions, not safe copy/export actions.

## Migration Plan

1. Add or update admin-only server endpoints for purge dry-run, purge execute, audit retrieval, and reason-aware abandoned-registration deletion as needed.
2. Redesign `MaintenanceArchive` into distinct risk sections and wire actions to the safer flows.
3. If structured audit metadata is chosen, add a Supabase migration and update generated database types.
4. Verify with `npm run build` and focused unit tests for new validation/API behavior where applicable.

Rollback: keep existing table structures intact where possible. If UI changes need rollback, the old client-side component can be restored independently of any additive API routes. If an audit-log migration is added, it should be additive and safe to leave in place.

## Open Questions

- Should this change extend `audit_log` with structured metadata, or encode reason/count details into the existing `action` field to avoid a migration?
- Should the aggregate all-students iCal feed be tokenized now, or only labeled as sensitive with improved copy/status feedback?
- Should purge delete all student records permanently, or should a future archive state replace some permanent deletion use cases?
