## Context

The Supabase security advisor scans for common misconfigurations. The project has five findings; two are false alarms (RLS tables accessed exclusively via service role), one requires a Pro plan (leaked-password protection), and two are genuine and fixable:

1. `refresh_pgrst_schema()` — a PostgREST internal function — has default `EXECUTE` grants to `anon` and `authenticated`, exposing it through `/rest/v1/rpc/`
2. Storage policies on `branding` and `onboarding-assets` buckets grant broad `SELECT` on `storage.objects`, allowing file enumeration

The project follows a migration-driven workflow: numbered `.sql` files in `supabase/migrations/` applied both locally and via the Supabase dashboard SQL editor.

## Goals / Non-Goals

**Goals:**
- Remove exposure of `refresh_pgrst_schema()` from the Data API
- Remove file-list capability from public storage buckets (direct URL access unaffected)

**Non-Goals:**
- Changing any RLS policy on application tables (existing "private vault" pattern is correct)
- Modifying how `register_onboarding_student` is accessed (anon access is intentional, authenticated was debated and left as-is)
- Adding new storage bucket policies (just dropping the listing ones)
- Any application code changes

## Decisions

### Decision 1: Revoke rather than restrict `refresh_pgrst_schema`

PostgREST calls `refresh_pgrst_schema()` with its `authenticator` role internally via `NOTIFY pgrst, 'reload schema'`. The anon/authenticated grants are incidental (created at extension setup) and serve no purpose. `REVOKE EXECUTE` is the correct fix.

**Alternative considered:** Wrapping in a SECURITY DEFINER function with access control. Rejected as overengineered — revoking is simpler and PostgREST itself never calls through the Data API.

### Decision 2: Drop rather than restrict storage policies

The `branding` and `onboarding-assets` buckets are both public (files served by direct URL, no auth required). The broad SELECT policies that allow listing serve no known purpose. Removing them is simpler than adding restrictive conditions.

**Alternative considered:** Adding a condition like `(auth.role() = 'admin')` to the policies. Rejected because no current feature relies on listing these buckets, and a restrictive policy could be confused for an intentional feature.

## Risks / Trade-offs

- **[Risk] `refresh_pgrst_schema` revocation could affect PostgREST schema cache refresh** → Mitigation: PostgREST uses its own role for internal calls, not anon/authenticated. Verified by confirming `NOTIFY pgrst` is the mechanism, which runs with the authenticator role.
- **[Risk] A client somewhere calls `storage.from('branding').list()`** → Mitigation: Grepped codebase for `.list()` calls on storage — none found for these buckets. Even if one exists, it would fail-safe (403 error) rather than silently exposing data.
- **[Risk] Leaked password protection cannot be enabled on current plan** → Mitigation: Documented as a known limitation. The advisor finding will persist until the project upgrades to a Pro plan. This is acceptable — the finding is informational and does not indicate an active vulnerability.
