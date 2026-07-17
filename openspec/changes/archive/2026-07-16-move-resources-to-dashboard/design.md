## Context

The fixed onboarding sequence currently includes Register, Legal, Resources, Quiz, and Submitted. `ResourceLibrary` reads active resource categories and documents directly from Supabase, but its completion controls advance the onboarding session. The dashboard currently reserves a section for preceptor profiles and clinical evaluations.

## Goals / Non-Goals

**Goals:**
- Keep onboarding focused on registration, legal acknowledgement, and the required policy quiz.
- Surface the existing admin-managed materials as a persistent dashboard reference library.
- Make Resources available while an account is pending without unlocking scheduling.
- Remove Preceptors & Evaluations from the dashboard without deleting the underlying capability.

**Non-Goals:**
- No database, RLS, API, or resource-content migration.
- No deletion of preceptor or evaluation components, data, or admin analytics.
- No change to certification, scheduling, messages, or calendar-feed access rules.

## Decisions

### Decision: Reuse resource data and presentation logic

Extract or adapt the current resource presentation so it can render without onboarding navigation callbacks. It continues to query active categories and documents in configured order.

Alternative considered: duplicate the fetch and card UI inside the dashboard. This would create two student library implementations that can drift.

### Decision: Resources are available to pending and certified students

The dashboard section is not locked for pending students. The existing schedule section remains locked until certification.

Alternative considered: certified-only materials. This would preserve the old timing without the old gate, but conflicts with the materials' study purpose.

### Decision: Remove, do not delete, Preceptors & Evaluations

Remove the section navigation item and its rendered dashboard panel. Leave components and data model untouched for later product reintroduction.

## Risks / Trade-offs

- Pending students can view materials before approval -> this is intentional and existing resources are already readable during public onboarding.
- Reusable component extraction can unintentionally retain onboarding copy -> provide explicit reference-library copy and omit completion controls outside onboarding.
- Old sessions may resume at the former Resources step -> normalize stored onboarding progress to the new sequence or route it directly to quiz.

## Migration Plan

1. Replace the Resources onboarding step with the quiz and update saved-step handling and both steppers.
2. Adapt the resource library into a reference presentation and add it to dashboard navigation.
3. Remove dashboard preceptor/evaluation rendering and imports only.
4. Verify pending access still exposes Resources, Messages, and Calendar Feed while schedule stays locked.
5. Run build and relevant tests. Roll back at the component/page level; no data rollback is needed.

## Open Questions

None.
