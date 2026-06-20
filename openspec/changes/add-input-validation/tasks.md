## 1. Foundation

- [x] 1.1 Install `zod` — `npm install zod`
- [x] 1.2 Create `src/lib/validation.ts` — shared Zod schemas: email, UUID, name, phone, bounded text, and API body schemas for legal-signature, create-auth-user, delete-student, schedule/cancel, schedule-action

## 2. Registration Form Fix

- [x] 2.1 Fix `src/components/onboarding/registration-form.tsx` — map `field_type='email'` to `type="email"`; add `autoComplete` attributes for email/tel; add Zod client-side validation before RPC call with error display; trim and lowercase email before send

## 3. API Route Validation

- [x] 3.1 Add Zod body validation to `src/app/api/onboarding/legal-signature/route.ts`
- [x] 3.2 Add Zod body validation to `src/app/api/admin/create-auth-user/route.ts`
- [x] 3.3 Add Zod body validation to `src/app/api/admin/delete-student/route.ts`
- [x] 3.4 Add Zod body validation to `src/app/api/schedule/cancel/route.ts`
- [x] 3.5 Add Zod body validation to `src/app/api/admin/schedule-action/route.ts`

## 4. Database Constraints

- [x] 4.1 Create migration `017`
- [x] 4.2 Apply migration to live Supabase

## 5. Verification

- [x] 5.1 Run `npm run build`
- [x] 5.2 Run `npm run test`
