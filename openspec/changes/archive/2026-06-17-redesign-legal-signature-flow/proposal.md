## Why

The current legal agreement step displays all documents simultaneously in cramped scrollable boxes with a generic text input for the signature — it reads like a web form, not a legally binding electronic signature. Students can check "I agree" without scrolling through documents, undermining the legal validity of the acceptance. A formal e-signature flow with focused document review, scroll-to-bottom enforcement, and a dedicated signature phase provides a stronger legal audit trail and better user experience.

## What Changes

- **Document review phase**: Display one document at a time with a progress indicator (dot navigation + "Doc X of Y"). Each document uses a spacious, full-height container with serif body text.
- **Scroll-to-bottom enforcement**: The "I agree" checkbox for each document is disabled until the user scrolls to the bottom of the document container. A subtle indicator shows when more content is below.
- **Signature phase**: After all documents are reviewed, transition to a dedicated signature block showing a summary of agreed documents, a visual signature line with the typed name and current date, and clear legal disclaimer text.
- **Single-document shortcut**: When only one document exists, the signature block appears inline below it — no separate phase or navigation needed.
- All existing API logic, per-document acceptance recording, and IP/timestamp capture remain unchanged.

## Capabilities

### New Capabilities

- `formal-esignature-flow`: A two-phase legal signature UX pattern — document review (one-at-a-time with scroll enforcement and progress tracking) followed by a dedicated signature block with summary checklist, visual signature line, date display, and legal disclaimer.

### Modified Capabilities

- `student-onboarding`: The legal waiver step now presents documents one at a time with scroll-to-bottom enforcement and a separate signature phase

## Impact

- **1 modified file**: `src/components/onboarding/legal-waiver.tsx` — replaces the current all-at-once + inline-signature layout with the two-phase flow
- **Zero API changes**, zero database changes, zero new dependencies
- No breaking changes to the parent onboarding orchestrator — the component still accepts the same `studentId`, `onComplete`, `onBack` props
