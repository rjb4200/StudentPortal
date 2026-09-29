## 1. Typing Indicator Hook

- [x] 1.1 Create `src/lib/use-typing-indicator.ts` — a custom hook that accepts `studentId` and `sender` ('student' | 'admin'), returns `{ isTyping: boolean, typingSender: 'student' | 'admin' | null, emitTyping: () => void }`
- [x] 1.2 Hook manages a Broadcast channel `typing:{studentId}`, subscribes to typing/idle events, runs a 3s debounce on emit and a 4s receiving timeout

## 2. Student Messages Typing

- [x] 2.1 Add `useTypingIndicator` to `src/components/dashboard/messages.tsx` — emit on keystroke (debounced), display "Staff is typing..." when `isTyping && typingSender === 'admin'`
- [x] 2.2 Typing indicator appears below the message list, above the input, in subtle gray italic text

## 3. Admin Conversation Typing

- [x] 3.1 Add `useTypingIndicator` to `src/components/admin/messages-page.tsx` — emit on reply input change (debounced), display "{Student Name} is typing..." when `isTyping && typingSender === 'student'`
- [x] 3.2 Typing indicator appears below the message list, above the reply input, in subtle gray italic text
- [x] 3.3 Apply same pattern to `src/components/admin/daily-ops.tsx` conversation view (N/A — DailyOps has no visible reply input; conversations happen in Messages tab)

## 4. Build Verification

- [x] 4.1 Run `npm run build` and fix any TypeScript errors
- [x] 4.2 Run `npm run test` and verify all existing tests pass
- [ ] 4.3 Manual test: open student dashboard and admin in two browsers, verify typing indicator appears for both parties
