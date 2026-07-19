## 1. Fix

- [x] 1.1 Replace the absolute-positioned dot `<span>` in `src/components/dashboard/messages.tsx` with conditional `border-l-[3px] border-l-wfd-crimson pl-1` class on the bubble `<div>` when `isUnreadAdminMessage` is true

## 2. Verification

- [x] 2.1 Run `npm run build` to verify no compilation errors
- [ ] 2.2 Visual check: unread admin message shows crimson left bar, no clipping
