## 1. Fix Access Race

- [x] 1.1 Refactor `src/app/admin/setup/page.tsx` useEffect — move `loadWelcome()` and `loadHelpEmail()` inside the `.then()` callback after `canAccessAdmin()` passes; add `rejected` state; replace `window.location.href` redirect with "Access Denied" error display

## 2. Verification

- [x] 2.1 Run `npm run build` to verify no TypeScript errors
- [x] 2.2 Run `npm run test` to verify all existing tests still pass
