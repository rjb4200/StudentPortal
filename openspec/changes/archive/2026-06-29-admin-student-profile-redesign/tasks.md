## 1. Foundation: UI Primitives and Route

- [x] 1.1 Create `Disclosure` component in `src/components/ui/disclosure.tsx` — collapsible section with animated chevron, title, summary text in collapsed state, and reveal/hide animation using CSS transitions
- [x] 1.2 Export `Disclosure` from `src/components/ui/index.ts`
- [x] 1.3 Create `CompletenessWarnings` component in `src/components/admin/student-profile/completeness-warnings.tsx` — renders amber warning banners from a `warnings: string[]` prop
- [x] 1.4 Create the student profile page route at `src/app/admin/students/[id]/page.tsx` — async Server Component that fetches student + all joined data via `createServerClient`, validates admin access, handles invalid/missing student ID, and renders the profile shell

## 2. Status Summary Card

- [x] 2.1 Create `StudentSummaryCard` component — displays student name, email, status badge (color-mapped), class name, instructor name, TEI name, class start date, ride-time end date, onboarding completed indicator, legal documents signed indicator
- [x] 2.2 Handle missing data gracefully — show "—" or "None" for null fields
- [x] 2.3 Integrate summary card into the profile page above the expandable sections

## 3. Expandable Instructor, TEI, and Class Sections

- [x] 3.1 Create `InstructorSection` component — uses `Disclosure`, resolves `instructor_id` FK to display full instructor record (name, email, phone, status, site), includes quick-action buttons: email instructor, copy email, copy phone, link to registry
- [x] 3.2 Handle fallback when `instructor_id` is null but denormalized `instructor_name` exists — show text with warning badge
- [x] 3.3 Create `TeiSection` component — uses `Disclosure`, resolves `training_site_id` FK to display full training site record with quick-action buttons: email contact, copy email, copy phone
- [x] 3.4 Create `ClassSection` component — uses `Disclosure`, resolves `training_class_id` FK to display class name, start date, ride-time end date, status, associated site, and associated instructor with relative date indicators
- [x] 3.5 Handle null FK cases gracefully across all three sections — show "Not assigned" with completeness warning contribution

## 4. Student Roster Link Update

- [x] 4.1 In `src/components/admin/daily-ops.tsx` line 532, change the student name link from `/admin/accounts?edit=${s.id}` to `/admin/students/${s.id}`

## 5. Signed Legal Documents Section

- [x] 5.1 Create `LegalDocumentsSection` component — queries `student_legal_acceptances` joined with `legal_documents`, renders a table with columns: document name, status, signed date, view button, print button
- [x] 5.2 Implement "View" action — opens a modal showing the full document text with student signature details (legal name, IP, timestamp)
- [x] 5.3 Implement "Print" action — triggers `window.print()` with a print-optimized view of the selected document
- [x] 5.4 Add audit logging — call `auditLog('viewed_legal_document', adminEmail)` on view, `auditLog('printed_legal_document', adminEmail)` on print
- [x] 5.5 Handle empty state — show "No signed legal documents" when `student_legal_acceptances` is empty
- [x] 5.6 Integrate into profile page

## 6. Admin Notes Section

- [x] 6.1 Create `AdminNotesSection` component — displays existing notes from `admin_notes` table in reverse chronological order, each showing text, priority badge (orange for `high_accessibility`, blue for `normal`), and timestamp
- [x] 6.2 Add "Add Note" form — text input + priority selector, submits to API route
- [x] 6.3 Add delete button per note with confirmation dialog
- [x] 6.4 Create `POST /api/admin/students/[id]/notes` route — validates admin role, inserts into `admin_notes` with student ID, note text, priority, and timestamp
- [x] 6.5 Create `DELETE /api/admin/students/[id]/notes` route — validates admin role, deletes the specified note by note ID, verifies it belongs to the correct student
- [x] 6.6 Handle empty state — show "No admin notes" with the add form still visible

## 7. Onboarding Test Status Section

- [x] 7.1 Create `OnboardingTestSection` component — displays `onboarding_completed_at` (or "Not completed"), lists quiz flags with rule title, attempt count, and acknowledgment status
- [x] 7.2 Integrate into profile page

## 8. Ride History Section

- [x] 8.1 Create `RideHistorySection` component — renders a table of `schedules` records with columns: date, shift type, time, status badge, cancel reason (if applicable)
- [x] 8.2 Add status filter tabs (All / Approved / Cancelled / Rejected / Pending)
- [x] 8.3 Handle empty state — show "No ride history available"

## 9. Full Student Packet Export

- [x] 9.1 Create `PrintPacketButton` component — triggers print of the entire profile page
- [x] 9.2 Add print CSS (`@media print`) to hide navigation, action buttons, and UI chrome; force all `Disclosure` sections to expanded state in print
- [x] 9.3 Ensure legal document signatures, quiz flags, ride history, and admin notes render in print output

## 10. Data Completeness Warnings Integration

- [x] 10.1 On the server component, compute warnings array from fetched data (null `training_site_id`, null `instructor_id`, missing instructor phone, empty legal docs, null `onboarding_completed_at`, null `training_class_id`)
- [x] 10.2 Pass warnings to `CompletenessWarnings` component rendered at the top of the profile page

## 11. Polish and Verification

- [x] 11.1 Add a "Back to Admin" breadcrumb link at the top of the profile page
- [x] 11.2 Add an "Edit Student" link pointing to `/admin/accounts?edit=<id>` for quick access to the edit form
- [ ] 11.3 Test all expand/collapse transitions for smooth animation
- [ ] 11.4 Test print output in Chrome and Firefox for individual documents and full packet
- [ ] 11.5 Verify admin-only access — non-admin users receive 403
- [ ] 11.6 Verify audit log entries are created on document view and print
- [x] 11.7 Run `npm run build` to verify no compilation errors
- [x] 11.8 Run `npm run test` to verify no regressions — 39/39 passing, pre-existing validation test fixed

## 12. Styling and Completeness Polish

- [x] 12.1 Add missing instructor fields — mobile_phone, title, credentials, preferred_contact_method, preferred_contact_hours, contact_instructions
- [x] 12.2 Wrap Legal Documents section in Disclosure with collapsed summary showing count
- [x] 12.3 Wrap Admin Notes section in Disclosure with collapsed summary showing count
- [x] 12.4 Wrap Onboarding Test section in Disclosure with collapsed summary showing status
- [x] 12.5 Wrap Ride History section in Disclosure with collapsed summary showing count/breakdown
- [x] 12.6 Upgrade styling — more white space, crimson accent bar on summary card, colored left-border accents on disclosure headers, white backgrounds, status-driven section accents, looser spacing
- [x] 12.7 Verify class_start_date and ride_time_end_date fields (already in training_classes query)
- [x] 12.8 Rebuild and verify — passes, 39/39 tests
