## 1. Database

- [x] 1.1 Create migration `005_portal_settings.sql` — `portal_settings` table with `key` text PK, `value` text, `updated_at` timestamptz; seed `help_email` = `jbrown@winchesterky.com`; RLS enabled with admin write, anon read on public keys
- [x] 1.2 Apply migration to live Supabase project via `supabase_apply_migration`
- [x] 1.3 Run `supabase_generate_typescript_types` and update `src/lib/supabase/database.types.ts`

## 2. API

- [x] 2.1 Create `src/app/api/settings/route.ts` — GET endpoint that reads `portal_settings` by `key` query param, returns `{ key, value }`, accessible without auth

## 3. Admin UI

- [x] 3.1 Add help email card to `src/app/admin/setup/page.tsx` — text input pre-filled from `portal_settings`, save button that upserts `help_email` key

## 4. Onboarding Integration

- [x] 4.1 Update `src/app/onboarding/page.tsx` — fetch `help_email` from `/api/settings` on mount, store in state, pass `helpEmail` prop to all 5 step components
- [x] 4.2 Update `registration-form.tsx` — accept `helpEmail` prop, use in help footer (fallback to `jbrown@winchesterky.com` if not provided)
- [x] 4.3 Update `legal-waiver.tsx` — accept `helpEmail` prop, use in help footer
- [x] 4.4 Update `resource-library.tsx` — accept `helpEmail` prop, use in help footer
- [x] 4.5 Update `knowledge-gate.tsx` — accept `helpEmail` prop, use in help footer in all views (rule, question, complete)
- [x] 4.6 Update `onboarding-complete.tsx` — accept `helpEmail` prop (though this step has no help footer currently)
- [x] 4.7 Update `onboarding-intro.tsx` — accept `helpEmail` prop, use in the bottom help bar

## 5. Verification

- [x] 5.1 Run `npm run build` and confirm zero errors
- [x] 5.2 Manually verify: admin changes help email on `/admin/setup`, refresh onboarding — help footer shows new email
- [x] 5.3 Manually verify: default email shown when no setting configured
