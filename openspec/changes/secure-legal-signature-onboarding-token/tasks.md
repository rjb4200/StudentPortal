## 1. Validation schema

- [x] 1.1 Add `onboardingToken: z.string().min(32).max(256)` to `legalSignatureBody` in `src/lib/validation.ts`

## 2. API route — token verification

- [x] 2.1 Import `hashOnboardingToken` in `src/app/api/onboarding/legal-signature/route.ts`
- [x] 2.2 Add token verification logic: query `onboarding_sessions` by `student_id` and `token_hash`, verify session exists, not expired, and not completed
- [x] 2.3 Return 403 if session invalid/expired, 409 if already completed

## 3. Frontend — pass token

- [x] 3.1 Add `onboardingToken: string` prop to `LegalWaiver` component interface
- [x] 3.2 Include `onboardingToken` in the POST body to `/api/onboarding/legal-signature`
- [x] 3.3 Pass `onboardingToken` from onboarding page to `<LegalWaiver>` component

## 4. Database — enable RLS

- [x] 4.1 Create migration to enable RLS on `student_legal_acceptances`
- [x] 4.2 Apply migration to live Supabase project via dashboard SQL editor

## 5. Verification

- [x] 5.1 Run `npm run build` to confirm no compilation errors
