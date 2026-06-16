## 1. Restructure daily-ops.tsx

- [x] 1.1 Replace three separate `<Card>` components (Approval Queue, Schedule Requests, Quiz Flags) with a single unified "Action Required" card using `<Card className="p-4 lg:col-span-2">`
- [x] 1.2 Add type badges to each item: green "Approval", blue "Schedule", amber "Flag" — rendered as small colored pill badges next to each item
- [x] 1.3 Sort items by priority: approvals first, then schedule requests, then quiz flags — each group sorted by `created_at` descending
- [x] 1.4 Implement unified empty state: "Nothing requires your attention" when all three lists are empty
- [x] 1.5 Keep all existing action handlers unchanged (handleApprove, handleScheduleAction, handleAcknowledgeFlag)

## 2. Verification

- [x] 2.1 Run `npm run build` to verify no TypeScript or compilation errors
- [x] 2.2 Manual test: verify all three item types render with correct badges and action buttons
- [x] 2.3 Manual test: verify unified empty state when no items exist
