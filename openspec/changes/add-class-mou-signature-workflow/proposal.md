## Why

Instructors need a completed MOU for each registered class. This is currently handled outside the portal. Adding an electronic two-party signature workflow with PDF generation and email delivery eliminates the manual paper process and keeps the signed agreement in portal records.

## What Changes

- Add an MOU review and electronic signature step as the fourth and final step in the instructor registration workflow.
- Create a `class_mous` database table to store one MOU per training class, including filled fields, body snapshot, and both party signatures.
- Store the WFEMS signer defaults (name, title, organization) as admin-configurable portal settings.
- Add MOU items to the admin Daily Ops action queue that are informational and do not block class approval.
- Generate a completed MOU as a PDF on department letterhead after both parties sign.
- Email the completed MOU PDF as an attachment to the instructor and to subscribed admin accounts.
- Retain completed MOU records for later admin printing and download through a printable admin route.

## Capabilities

### New Capabilities

- `class-mou-electronic-signature`: Two-party MOU electronic signature workflow with database records, PDF generation on letterhead, and branded email delivery.

### Modified Capabilities

- `instructor-registration-access-guidance`: Instructor registration gains a mandatory MOU review and signature step; submission confirmation reflects the two-party signature workflow.
- `admin-command-center`: Daily Ops displays MOU items awaiting WFEMS signature in the action queue with view and sign actions.

## Impact

- Affected code: `src/app/instructor-registration/`, `src/app/api/instructor/register/`, `src/components/admin/daily-ops.tsx`, `src/lib/email-templates.ts`, `src/lib/email.ts`, `src/lib/validation.ts`, `src/app/admin/`.
- Database: new `class_mous` table, new portal settings for WFEMS signer defaults, new notification preference column on `admin_accounts`.
- PDF generation: may introduce a server-side PDF dependency or API route for PDF generation.
- Storage: completed MOU PDFs may be stored in Supabase Storage or regenerated on demand.
- Verification: `npm run build` and `npm run test`.
