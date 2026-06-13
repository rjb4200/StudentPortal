## 1. New Setup Page

- [ ] 1.1 Create `src/app/admin/setup/page.tsx` rendering all 5 onboarding config components (QuizConfig, RegistrationFieldsConfig, LegalDocsConfig, ResourceLibraryConfig, welcome message editor)
- [ ] 1.2 Add "Back to Admin Command Center" link at top of setup page
- [ ] 1.3 Verify middleware protects `/admin/setup` (no code changes needed, just confirm)

## 2. Admin Page Hamburger Menu

- [ ] 2.1 Add hamburger icon (≡) button to Admin Command Center header
- [ ] 2.2 Build dropdown menu with "Onboarding Setup" link that navigates to `/admin/setup`
- [ ] 2.3 Add click-outside-to-close behavior for the dropdown
- [ ] 2.4 Style hamburger and dropdown to match existing admin design

## 3. Maintenance & Archive Cleanup

- [ ] 3.1 Remove QuizConfig import and render from Maintenance & Archive
- [ ] 3.2 Remove RegistrationFieldsConfig import and render from Maintenance & Archive
- [ ] 3.3 Remove LegalDocsConfig import and render from Maintenance & Archive
- [ ] 3.4 Remove ResourceLibraryConfig import and render from Maintenance & Archive
- [ ] 3.5 Remove "Onboarding Configuration" section heading

## 4. Daily Ops Welcome Message Placeholder

- [ ] 4.1 Remove welcome message state variables and handler functions from DailyOps
- [ ] 4.2 Remove welcome message editor JSX from DailyOps
- [ ] 4.3 Add read-only welcome message preview card showing current title and truncated body
- [ ] 4.4 Add "Edit in Onboarding Setup →" link that navigates to `/admin/setup`
- [ ] 4.5 Handle empty state when no welcome message is configured

## 5. Verification

- [ ] 5.1 Verify `/admin/setup` page loads all 5 config components without errors
- [ ] 5.2 Verify non-admin users are blocked from `/admin/setup`
- [ ] 5.3 Verify hamburger dropdown appears and navigates correctly
- [ ] 5.4 Verify Maintenance & Archive shows only Master Export, Purge, and iCal Feed
- [ ] 5.5 Verify Daily Ops shows welcome message preview card with edit link
- [ ] 5.6 Run production build and resolve any issues
