## Why

TEI/class registration currently performs only presence checks while moving through the form, then discovers schema failures at final MOU submission. The resulting generic error does not identify the invalid step or field, leaving registrants unable to complete their registration.

## What Changes

- Validate TEI, instructor, and class data against the shared registration schema before advancing from each respective step.
- Display actionable, field-associated validation feedback and move the user to the step containing a final-submission error.
- Prevent MOU submission when its required template cannot be loaded or rendered.
- Return structured validation issues from the instructor registration API while retaining a readable fallback error.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `class-mou-electronic-signature`: Require an available rendered MOU before a signed registration can be submitted.
- `input-validation`: Require step-level validation and actionable structured errors for TEI registration.

## Impact

- `src/app/instructor-registration/page.tsx`
- `src/app/api/instructor/register/route.ts`
- `src/lib/validation.ts` and validation tests
- Instructor registration and MOU submission behavior
