## 1. New Setup Page

- [x] 1.1 Create `src/app/admin/setup/page.tsx` rendering all 5 onboarding config components (QuizConfig, RegistrationFieldsConfig, LegalDocsConfig, ResourceLibraryConfig, welcome message editor)
- [x] 1.2 Add "Back to Admin Command Center" link at top of setup page
- [x] 1.3 Verify middleware protects `/admin/setup` (no code changes needed, just confirm)

## 2. Admin Page Hamburger Menu

- [x] 2.1 Add hamburger icon (≡) button to Admin Command Center header
- [x] 2.2 Build dropdown menu with "Onboarding Setup" link that navigates to `/admin/setup`
- [x] 2.3 Add click-outside-to-close behavior for the dropdown
- [x] 2.4 Style hamburger and dropdown to match existing admin design

## 3. Maintenance & Archive Cleanup

- [x] 3.1 Remove QuizConfig import and render from Maintenance & Archive
- [x] 3.2 Remove RegistrationFieldsConfig import and render from Maintenance & Archive
- [x] 3.3 Remove LegalDocsConfig import and render from Maintenance & Archive
- [x] 3.4 Remove ResourceLibraryConfig import and render from Maintenance & Archive
- [x] 3.5 Remove "Onboarding Configuration" section heading

## 4. Daily Ops Welcome Message Placeholder

- [x] 4.1 Remove welcome message state variables and handler functions from DailyOps
- [x] 4.2 Remove welcome message editor JSX from DailyOps
- [x] 4.3 Add read-only welcome message preview card showing current title and truncated body
- [x] 4.4 Add "Edit in Onboarding Setup →" link that navigates to `/admin/setup`
- [x] 4.5 Handle empty state when no welcome message is configured

## 5. Verification

- [x] 5.1 Verify `/admin/setup` page loads all 5 config components without errors
- [x] 5.2 Verify non-admin users are blocked from `/admin/setup`
- [x] 5.3 Verify hamburger dropdown appears and navigates correctly
- [x] 5.4 Verify Maintenance & Archive shows only Master Export, Purge, and iCal Feed
- [x] 5.5 Verify Daily Ops shows welcome message preview card with edit link
- [x] 5.6 Run production build and resolve any issues
