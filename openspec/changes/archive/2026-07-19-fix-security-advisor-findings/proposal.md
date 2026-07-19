## Why

Supabase's security advisor flagged five findings in the production project. Two are false alarms (RLS-enabled tables accessed exclusively via service role), one requires a Pro plan (leaked-password protection), and two represent real, fixable security posture improvements: an internal PostgREST function is exposed to unauthenticated callers, and public storage buckets allow full file enumeration. Neither is actively exploited, but both weaken defense-in-depth.

## What Changes

- **Revoke EXECUTE on `refresh_pgrst_schema()`** from the `anon` and `authenticated` roles. This PostgREST internal function has no business being callable through the Data API. PostgREST calls it with its own role internally, so this has zero impact on schema cache refreshes.
- **Drop broad SELECT policies on `branding` and `onboarding-assets` storage buckets** that allow unauthenticated callers to enumerate all files. Public file access via direct URL continues to work — only the listing capability is removed.

## Capabilities

### New Capabilities
- `supabase-security-hardening`: Proactive configuration of Supabase platform features to reduce attack surface. Covers limiting Data API exposure of internal functions and tightening storage bucket policies.

### Modified Capabilities
<!-- No existing spec requirements change. The storage spec's "public read access" requirement is preserved (direct URL access), only the separate listing capability is removed. The password-auth spec's behavior is unchanged (leaked-password check is additive validation, not a requirement change). -->

## Impact

- **Database**: One SQL migration revoking EXECUTE on `refresh_pgrst_schema()` from `anon` and `authenticated`. One SQL migration dropping two storage policies.
- **No code changes**: No application code is affected. Storage uploads, onboarding registration, and password flows behave identically.
- **No breaking changes**: `refresh_pgrst_schema()` was never called by application code. Bucket file URLs still resolve.
