## 1. Per-view filter state

- [x] 1.1 Replace the flat `query`/`statusFilter`/`lifecycleFilter` state in `src/components/admin/registry-management.tsx` with a per-view map keyed by view (`classes`, `instructors`, `sites`), each holding `{ query, status, lifecycle? }`
- [x] 1.2 Derive the active `query`, `statusFilter`, and `lifecycleFilter` from the selected view's bucket
- [x] 1.3 Update the filter setters to write into the selected view's bucket

## 2. Defaults and tab behavior

- [x] 2.1 Initialize `status = 'active'` for all views and `lifecycle = 'in_progress'` for Classes
- [x] 2.2 Change `changeView` to only set the selected view (remove the reset to `'all'`)
- [x] 2.3 Keep the "Review expired classes" action writing Active + Expired into the Classes bucket

## 3. Pinned pending records

- [x] 3.1 Render a "Needs approval" block at the top of all three views listing pending records
- [x] 3.2 Make the pinned block ignore the Status and Lifecycle filters but respect the search query
- [x] 3.3 Render the pinned block only when the active filter would hide pending records
- [x] 3.4 Exclude pinned records from the filtered list to avoid duplicates
- [x] 3.5 Sort pinned records longest-waiting first
- [x] 3.6 Keep the "Review pending" quick action to switch the current view to Status = Pending

## 4. Filter select cleanup

- [x] 4.1 Suppress the blank `Select...` option for the Status and Lifecycle filter selects

## 5. Verification

- [x] 5.1 Run `npm run build`
- [ ] 5.2 Manual: Registry opens with Classes Status = Active and Lifecycle = In progress; Instructors/Sites open at Active
- [ ] 5.3 Manual: changing a filter, switching tabs, and returning restores the last-used value; an untouched tab shows its default
- [ ] 5.4 Manual: pending records appear in the pinned block regardless of Status/Lifecycle, respect search, and are not duplicated; no pinned block renders when the filter already shows pending
