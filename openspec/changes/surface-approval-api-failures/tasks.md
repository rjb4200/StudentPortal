## 1. Approval API Contract

- [x] 1.1 Update `src/app/api/admin/approve-student/route.ts` to check the Supabase student update result.
- [x] 1.2 Return a non-OK JSON response with an `error` message when certification update fails.
- [x] 1.3 Preserve existing successful approval behavior, including `success: true`, 120-day access expiry, and account-approved email delivery.

## 2. Daily Ops Approval UI

- [x] 2.1 Add approval error state to `src/components/admin/daily-ops.tsx`.
- [x] 2.2 Update `handleApprove` to parse the API response, require `response.ok`, and require `success: true` before treating approval as successful.
- [x] 2.3 Display a useful inline error message in the Action Required approval area when approval fails.
- [x] 2.4 Only call `loadAll()` after confirmed approval success, leaving failed pending approvals visible.
- [x] 2.5 Clear the approval error before retrying and after confirmed success.

## 3. Verification

- [x] 3.1 Run `npm run build`.
- [x] 3.2 Manually review the approval failure paths for 403, 400, 404, update failure, malformed JSON, and network failure behavior.
