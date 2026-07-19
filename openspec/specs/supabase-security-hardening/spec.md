# supabase-security-hardening Specification

## Purpose
TBD - created by archiving change fix-security-advisor-findings. Update Purpose after archive.
## Requirements
### Requirement: PostgREST internal functions are not exposed to Data API
The system SHALL revoke EXECUTE on `refresh_pgrst_schema()` from the `anon` and `authenticated` PostgreSQL roles so that the function cannot be called through `/rest/v1/rpc/refresh_pgrst_schema`.

#### Scenario: Anon cannot call refresh_pgrst_schema
- **WHEN** an unauthenticated client calls `/rest/v1/rpc/refresh_pgrst_schema`
- **THEN** the request is rejected with a permissions error

#### Scenario: Authenticated user cannot call refresh_pgrst_schema
- **WHEN** an authenticated (non-admin) client calls `/rest/v1/rpc/refresh_pgrst_schema`
- **THEN** the request is rejected with a permissions error

#### Scenario: PostgREST schema cache refresh still works
- **WHEN** PostgREST detects a schema change and reloads its cache internally
- **THEN** the schema cache refreshes normally (PostgREST uses its own role, not anon/authenticated)

### Requirement: Public storage buckets do not allow file listing
The system SHALL drop broad SELECT policies on `storage.objects` for the `branding` and `onboarding-assets` buckets so that files cannot be enumerated, while direct URL access to individual files continues to work.

#### Scenario: File listing is rejected on branding bucket
- **WHEN** a client calls `storage.from('branding').list()`
- **THEN** the request is rejected with a permissions error

#### Scenario: File listing is rejected on onboarding-assets bucket
- **WHEN** a client calls `storage.from('onboarding-assets').list()`
- **THEN** the request is rejected with a permissions error

#### Scenario: Direct file URLs still resolve
- **WHEN** a client requests a public URL for a file in the `branding` or `onboarding-assets` bucket
- **THEN** the file is served normally with a 200 response

