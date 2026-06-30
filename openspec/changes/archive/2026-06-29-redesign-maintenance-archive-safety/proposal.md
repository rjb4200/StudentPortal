## Why

The Maintenance & Archive admin tools currently present export, abandoned-registration cleanup, purge, and calendar-feed actions as simple cards despite very different risk levels. High-risk workflows need clearer separation, deliberate confirmation, dry-run context, operational feedback, and audit visibility so administrators do not accidentally remove or expose sensitive student data.

## What Changes

- Redesign the Maintenance & Archive tab into separate export, archive cleanup, purge, calendar-feed, and audit visibility sections.
- Move destructive workflows into a visually distinct danger zone using WFD branding and modern admin safety patterns.
- Add dry-run summaries before destructive purge actions, including impacted record counts and preserved record categories.
- Require deliberate typed confirmation and an admin reason before purge and abandoned-registration deletion actions execute.
- Add progress/status feedback for export, abandoned-registration deletion, and purge workflows.
- Surface audit visibility through recent audit-log entries or links from the maintenance interface.
- Keep master export as the prerequisite for bulk purge, but make the prerequisite and completion state explicit.
- Preserve existing student-facing behavior and existing public/admin routes unless a safety requirement explicitly changes them.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-command-center`: Maintenance & Archive tab requirements change to separate routine, sensitive, and destructive administration workflows with stronger feedback and confirmation.
- `data-management`: Export, purge, and audit logging requirements change to require dry-run context, progress/status feedback, reason capture, and audit visibility for high-risk operations.
- `safe-student-removal`: Student deletion requirements change to require admin reason capture and deliberate typed confirmation for abandoned-registration cleanup deletions.

## Impact

- Affected UI: `src/components/admin/maintenance-archive.tsx`, shared UI components as needed, and the admin command center tab presentation.
- Affected APIs: likely new or revised admin maintenance endpoints for purge dry-run/execute, export status, audit retrieval, and reason-aware abandoned-registration deletion.
- Affected database/types: may require extending `audit_log` with structured metadata or encoding reason/count data in the existing action text if schema changes are intentionally avoided.
- Affected security posture: high-risk actions move away from routine admin workflows and require explicit human intent before execution.
- Verification: `npm run build` and targeted tests for new server-side admin maintenance behavior if APIs are added.
