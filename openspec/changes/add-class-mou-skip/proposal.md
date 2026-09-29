## Why

Some training organizations already have an executed MOU with WFEMS, provide their own MOU, or have the agreement handled through their college's legal department. Today the instructor class-registration workflow forces every organization to sign the WFEMS MOU template in order to submit, which blocks otherwise valid registrations and pushes those organizations to work around the portal. WFEMS needs a way to accept these classes while still capturing the organization's acknowledgment that a MOU is required for students to ride.

## What Changes

- Add a de-emphasized, always-available **skip** affordance to Step 4 (MOU) of the instructor class-registration workflow. The signature path remains the primary action.
- Require the organization to acknowledge the MOU requirement before submitting without signing. The acknowledgment captures one of two reasons: **"We already have an executed MOU with WFEMS"** or **"We will execute an MOU with WFEMS separately"**, plus the acknowledging representative's name.
- Accept a skipped submission through the instructor registration API by making the `mou` payload a discriminated union (`signed` | `skipped`).
- Record the skip in a new **`class_mou_skips`** table (one row per training class) separate from `class_mous`, which continues to represent actual signed MOUs only.
- Suppress the "MOU awaiting WFEMS signature" email when a registration is submitted with a skip.
- Surface a **"No MOU"** item in the admin Action Required card for skipped classes, showing the class, TEI, instructor, and skip reason, with an **Acknowledge** action that dismisses it. Dismissal records `dismissed_at` and `dismissed_by`.
- Update the post-submit confirmation copy to reflect the acknowledgment instead of a signed MOU.
- No change to student behavior: a skipped MOU does not block class approval, onboarding, scheduling, or ride-time. The MOU is tracked off-platform.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `class-mou-electronic-signature`: The instructor MOU step is no longer strictly mandatory. The requirement changes to allow an acknowledged skip that records a skip reason in `class_mou_skips`, and to suppress the pending-signature notification when skipped.
- `admin-command-center`: The Action Required card gains a seventh item type — a "No MOU" acknowledgment item for skipped classes with an Acknowledge (dismiss) action.

## Impact

- **Instructor registration UI** (`src/app/instructor-registration/page.tsx`): Step 4 skip link, acknowledgment form, submit-without-signing path, confirmation copy branch.
- **Instructor registration API** (`src/app/api/instructor/register/route.ts`): accept `mou.mode = 'skipped'`, insert `class_mou_skips`, skip the awaiting-signature email.
- **Validation** (`src/lib/validation.ts`): `mou` becomes a discriminated union.
- **Admin Daily Ops** (`src/components/admin/daily-ops.tsx`): load skipped classes, render No MOU item, acknowledge handler, include in `totalActions`.
- **New admin API route**: acknowledge/dismiss endpoint for a skip record.
- **Database**: new `class_mou_skips` table (RLS admin-only), with migration applied live per repo rules.
- **Generated types**: `src/lib/supabase/database.types.ts` updated for the new table.
- No change to `class_mous`, student onboarding, scheduling, or middleware.
