## 1. Setup

- [x] 1.1 Install `server-only` npm package (`npm install server-only`)
- [x] 1.2 Create `src/lib/env.ts` with `required()` helper, `publicEnv`, and `serverEnv` exports as designed

## 2. Shared Supabase client modules

- [x] 2.1 Update `src/lib/supabase/client.ts` to import from `publicEnv` instead of `process.env.X!`
- [x] 2.2 Update `src/lib/supabase/server.ts` to import from `publicEnv` instead of `process.env.X!`
- [x] 2.3 Update `src/lib/supabase/admin.ts` to import from `publicEnv` and `serverEnv` instead of `process.env.X!`

## 3. Middleware and auth callback

- [x] 3.1 Update `src/middleware.ts` to import from `publicEnv` instead of `process.env.X!`
- [x] 3.2 Update `src/app/auth/callback/route.ts` to import from `publicEnv` instead of `process.env.X!`

## 4. Notification API routes

- [x] 4.1 Refactor `src/app/api/notify/onboarding-complete/route.ts` to use shared Supabase client modules and `serverEnv`/`publicEnv`
- [x] 4.2 Refactor `src/app/api/notify/flagged-evaluation/route.ts` to use shared Supabase client modules and `serverEnv`/`publicEnv`
- [x] 4.3 Refactor `src/app/api/notify/evaluation-receipt/route.ts` to use shared Supabase client modules and `serverEnv`/`publicEnv`

## 5. Admin API routes

- [x] 5.1 Refactor `src/app/api/admin/approve-student/route.ts` to use shared Supabase client modules
- [x] 5.2 Refactor `src/app/api/admin/create-auth-user/route.ts` to use shared Supabase client modules
- [x] 5.3 Refactor `src/app/api/admin/delete-auth-user/route.ts` to use shared Supabase client modules
- [x] 5.4 Refactor `src/app/api/admin/update-auth-user/route.ts` to use shared Supabase client modules
- [x] 5.5 Refactor `src/app/api/admin/reset-test-student/route.ts` to use shared Supabase client modules
- [x] 5.6 Refactor `src/app/api/admin/acknowledge-quiz-flag/route.ts` to use shared Supabase client modules

## 6. Other API routes

- [x] 6.1 Refactor `src/app/api/settings/route.ts` to use shared Supabase client module
- [x] 6.2 Refactor `src/app/api/quiz/flag/route.ts` to use shared Supabase client modules
- [x] 6.3 Refactor `src/app/api/health/route.ts` to use shared Supabase client modules
- [x] 6.4 Refactor `src/app/api/cron/sweep/route.ts` to use shared Supabase client modules
- [x] 6.5 Refactor `src/app/api/calendar/[studentId]/route.ts` to use shared Supabase client modules
- [x] 6.6 Refactor `src/app/api/calendar/all/route.ts` to use shared Supabase client modules

## 7. Cleanup and documentation

- [x] 7.1 Update `.env.example` to mark each variable as required or optional and remove `ONBOARDING_TOKEN`
- [x] 7.2 Remove `ONBOARDING_TOKEN` from `.env.local`

## 8. Verification

- [x] 8.1 Run `npm run build` and confirm zero errors
- [x] 8.2 Verify `process.env.NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are no longer accessed directly in any file outside `src/lib/env.ts` and the 3 shared client modules
