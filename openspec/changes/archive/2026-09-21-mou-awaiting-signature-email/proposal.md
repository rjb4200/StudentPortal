## Why

When an instructor completes MOU registration, the `class_mous` record is created with the instructor's signature but the WFEMS admin signature remains pending. Currently no email is sent to admins at this point -- they only become aware of the pending signature when they check the Daily Ops dashboard. An immediate email notification closes this gap, prompting timely admin action.

## What Changes

- Add a new email template `buildMouAwaitingAdminSignatureEmail` that notifies admins an instructor has signed the MOU and their signature is still needed
- Send this email from the `instructor/register` API route immediately after the `class_mous` record is created
- Recipients are all active admins with `notify_class_mou = true` (the same toggle already used for completed MOU emails)
- The email includes the class name, training site, instructor name, and a clear call-to-action that admin signature is required

## Capabilities

### New Capabilities
<!-- None. This is a modification of an existing workflow. -->

### Modified Capabilities
- `class-mou-electronic-signature`: adds an admin notification requirement triggered on instructor MOU submission, sent prior to WFEMS signature

## Impact

- `src/lib/email-templates.ts` -- new template function
- `src/app/api/instructor/register/route.ts` -- add email send after MOU insert (`~line 196`)
- Existing `admin_accounts.notify_class_mou` column serves as the opt-in toggle (no DB changes needed)
