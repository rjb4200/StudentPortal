## 1. Database And Settings

- [x] 1.1 Create `class_mous` table migration with all columns from the design, including FK to `training_classes` with a unique constraint.
- [x] 1.2 Enable RLS on `class_mous` with admin-only policies.
- [x] 1.3 Add `notify_class_mou` boolean column to `admin_accounts` table with default false.
- [x] 1.4 Insert default MOU template body and WFEMS signer values into `portal_settings`.
- [x] 1.5 Apply migration in Supabase dashboard SQL editor and regenerate TypeScript types.

## 2. MOU Template And WFEMS Signer Configuration

- [x] 2.1 Build an admin settings section to view and edit MOU template body text.
- [x] 2.2 Build an admin settings section to view and edit WFEMS signer name, title, and organization.
- [x] 2.3 Build an admin settings section to manage the department letterhead (upload image to Supabase Storage `branding` bucket or reference existing image).

## 3. Instructor Registration MOU Step

- [x] 3.1 Add MOU step UI to `src/app/instructor-registration/page.tsx` as step 4, displaying the pre-filled MOU with TEI/instructor/class data from previous steps.
- [x] 3.2 Add electronic signature fields (representative name, title) pre-filled from instructor form with edit capability.
- [x] 3.3 Extend instructor registration API POST route to accept MOU data and create the `class_mous` record with instructor signature.
- [x] 3.4 Update instructor registration validation schema for MOU fields.
- [x] 3.5 Update submission confirmation message to reference the two-party MOU signature workflow.

## 4. Email And PDF Infrastructure

- [x] 4.1 Extend `sendEmail()` in `src/lib/email.ts` to support optional attachments parameter.
- [x] 4.2 Create an API route for MOU PDF generation using `jspdf` with letterhead header, MOU body snapshot, and both signature blocks.
- [x] 4.3 Add MOU email templates to `src/lib/email-templates.ts` for instructor and admin MOU completion emails.

## 5. Admin Daily Ops MOU Items

- [x] 5.1 Load MOU records awaiting WFEMS signature in Daily Ops `loadAll()`.
- [x] 5.2 Display MOU items in the Action Required card with class name, TEI, instructor name, instructor signature date, and "Sign as WFEMS" action.
- [x] 5.3 Implement admin WFEMS sign action: read signer defaults from portal settings, update `class_mous` record, generate PDF, email to instructor and subscribed admins.

## 6. Admin Printable MOU Route

- [x] 6.1 Create admin-only printable MOU route at `/admin/classes/[id]/mou` that renders the complete MOU from stored data.
- [x] 6.2 Style the printable MOU page with department letterhead, print-friendly layout, and signature blocks.

## 7. Verification

- [x] 7.1 Run `npm run build`.
- [x] 7.2 Run `npm run test`.
- [x] 7.3 Verify instructor registration end-to-end: TEI → Instructor → Class → MOU → Submit.
- [x] 7.4 Verify admin signs MOU, PDF is generated and attached to outgoing emails.
- [x] 7.5 Verify MOU does not block class approval.
