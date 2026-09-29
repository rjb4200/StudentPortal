## 1. Database

- [x] 1.1 Add migration `supabase/migrations/<timestamp>_add_class_mou_skips.sql` creating `class_mou_skips` with the columns, `UNIQUE (training_class_id)`, reason check constraint, cascading FK to `training_classes`, and `dismissed_by` FK to `admin_accounts` (`ON DELETE SET NULL`)
- [x] 1.2 Enable RLS on `class_mou_skips` and add an admin-only `FOR ALL` policy using `app_metadata.role = 'admin'`
- [x] 1.3 Apply the migration live to the connected Supabase project via the migration tool (SQL Editor equivalent) and verify the table and RLS
- [x] 1.4 Update `src/lib/supabase/database.types.ts` for the new table

## 2. Validation

- [x] 2.1 Change `instructorRegistrationBody.mou` in `src/lib/validation.ts` to a discriminated union: `signed` (existing `mouSchema` + `mode`) and `skipped` (`mode`, `reason` enum, `acknowledgedName`)
- [x] 2.2 Update `src/lib/validation.test.ts` to cover both union branches and rejection of an invalid skip reason

## 3. Instructor registration API

- [x] 3.1 In `src/app/api/instructor/register/route.ts`, branch on `payload.mou.mode`
- [x] 3.2 For `skipped`, insert a `class_mou_skips` row (class id, reason, organization name, acknowledged name) and do not insert `class_mous`
- [x] 3.3 For `skipped`, do not send the "MOU awaiting WFEMS signature" email; keep the signed path unchanged
- [x] 3.4 Log a skipped-insert failure without failing the registration

## 4. Instructor registration UI

- [x] 4.1 In `src/app/instructor-registration/page.tsx` Step 4, add a de-emphasized skip link below the signature/submit block
- [x] 4.2 Add the inline acknowledgment panel: two reason radios, required confirmation checkbox, and a secondary "Submit without signing" action
- [x] 4.3 Block both submit paths until either a valid signature or a completed skip acknowledgment is present
- [x] 4.4 Send `mou: { mode: 'signed', ... }` or `mou: { mode: 'skipped', reason, acknowledgedName }` in the submit payload
- [x] 4.5 Branch the post-submit confirmation copy for the skipped case

## 5. Admin acknowledge endpoint

- [x] 5.1 Add `POST /api/admin/acknowledge-mou-skip` (admin-authenticated, Zod-validated `{ skipId }`) that sets `dismissed_at` and `dismissed_by` from the signed-in admin account, mirroring `acknowledge-quiz-flag`

## 6. Admin Action Required

- [x] 6.1 Load undismissed `class_mou_skips` (with class, site, instructor, reason) in `src/components/admin/daily-ops.tsx`
- [x] 6.2 Render a "No MOU" item with a slate gray badge, class/TEI/instructor, skip reason, and an Acknowledge button
- [x] 6.3 Add a handler that calls the new endpoint and removes the item on success
- [x] 6.4 Include the No MOU count in `totalActions` and position the item after MOU Signatures

## 7. Verification

- [x] 7.1 `npm run test` passes (including updated validation tests)
- [x] 7.2 `npm run build` succeeds
- [ ] 7.3 Manually verify: signed submission still creates `class_mous` and emails admins
- [ ] 7.4 Manually verify: skipped submission creates `class_mou_skips`, sends no email, and shows a dismissible No MOU item for admins
- [ ] 7.5 Manually verify: a class with a skipped MOU can be approved and its students can onboard and schedule unchanged
