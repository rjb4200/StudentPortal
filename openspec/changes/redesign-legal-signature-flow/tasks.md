## 1. Document Review Phase

- [x] 1.1 Add `currentDocIndex` and `scrolledBottom` state to `legal-waiver.tsx`, plus `docRef` for scroll detection
- [x] 1.2 Implement scroll-to-bottom detection: `onScroll` handler that sets `scrolledBottom = true` when bottom is reached; auto-enable if content fits without scrolling
- [x] 1.3 Replace the all-at-once document list with a single-document viewer using `max-h-96` or similar spacious container, serif font for body text, and a header bar with the document title
- [x] 1.4 Add dot-based progress indicator and Previous/Next navigation buttons (hidden when only one document exists)
- [x] 1.5 Disable the agreement checkbox until `scrolledBottom` is true; add a subtle visual cue (e.g., "Scroll to continue") when scroll hasn't reached bottom

## 2. Signature Phase

- [x] 2.1 Add `mode: 'review' | 'sign'` state; after all documents are agreed to (or if single doc + agreed), render the signature block
- [x] 2.2 Build the signature block: summary checklist of agreed documents, name input, visual signature line with typed name and `new Date().toLocaleDateString()`, legal disclaimer text, and submit button
- [x] 2.3 Implement single-document shortcut: when only one doc exists, show signature block inline below it without a separate "Sign" button or phase transition
- [x] 2.4 Preserve existing API call logic (`/api/onboarding/legal-signature` with `studentId`, `fullName`, `agreedDocumentIds`) unchanged

## 3. Verification

- [x] 3.1 Run `npm run build` to verify no compilation errors
- [x] 3.2 Manually verify: test with 1 document, 2+ documents, scroll enforcement, signature block, and successful submission
