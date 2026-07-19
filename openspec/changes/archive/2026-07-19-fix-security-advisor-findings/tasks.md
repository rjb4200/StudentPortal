## 1. SQL Migration — Revoke internal function exposure

- [x] 1.1 Create migration file `supabase/migrations/20260719132700_revoke_refresh_pgrst_schema.sql` that revokes EXECUTE on `public.refresh_pgrst_schema()` from `anon` and `authenticated`
- [x] 1.2 Apply migration to live Supabase project via dashboard SQL editor
- [x] 1.3 Verify `/rest/v1/rpc/refresh_pgrst_schema` returns permission error for unauthenticated requests

## 2. SQL Migration — Drop storage bucket listing policies

- [x] 2.1 Create migration file `supabase/migrations/20260719132701_drop_storage_listing_policies.sql` that drops the "Public can read branding" and "Public can read onboarding assets" policies from `storage.objects`
- [x] 2.2 Apply migration to live Supabase project via dashboard SQL editor
- [x] 2.3 Verify `storage.from('branding').list()` and `storage.from('onboarding-assets').list()` return permission errors
- [x] 2.4 Verify direct file URLs in both buckets still resolve (e.g., `/storage/v1/object/public/branding/logo.png`)

## 3. Verification

- [x] 3.1 Re-run Supabase security advisor (`supabase_get_advisors type=security`) and confirm the two target findings are resolved (leaked-password finding will remain due to plan tier)
- [x] 3.2 Confirm no new findings were introduced by the policy drops
- [ ] 3.3 Smoke test: verify onboarding registration, file uploads in admin, and password reset flows still work
