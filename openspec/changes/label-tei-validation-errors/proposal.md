## Why

TEI registration now blocks invalid submissions, but generic Zod messages such as "Invalid input" do not tell registrants which field must be corrected.

## What Changes

- Display human-readable field labels with each TEI registration validation error.
- Deduplicate repeated validation messages while preserving the affected field context.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `input-validation`: TEI registration validation feedback identifies each affected form field.

## Impact

- `src/app/instructor-registration/page.tsx`
