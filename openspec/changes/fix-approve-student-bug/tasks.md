## 1. API Route

- [x] 1.1 Create `POST /api/admin/approve-student` route

## 2. Daily Ops Fix

- [x] 2.1 Replace `approveStudent()` in `handleApprove` with `fetch('/api/admin/approve-student', ...)`
- [x] 2.2 Remove `approveStudent` import

## 3. Verification

- [x] 3.1 Verify Approve button certifies student, sets access_until, and sends magic link
- [x] 3.2 Verify queue refreshes after approval
- [x] 3.3 Verify approving an already-certified student is idempotent
- [x] 3.4 Run production build and resolve any issues
