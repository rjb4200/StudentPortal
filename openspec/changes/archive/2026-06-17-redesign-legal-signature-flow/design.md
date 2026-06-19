## Context

`legal-waiver.tsx` displays all documents at once in `max-h-48` scrollable boxes with checkboxes and a single `Input` at the bottom for the signature name. There is no scroll enforcement, no progress tracking, and no visual distinction between document review and signing. The API route (`/api/onboarding/legal-signature`) already accepts per-document IDs and captures real IP/timestamp — only the UI needs redesign.

## Goals / Non-Goals

**Goals:**
- Single-document review with progress dots and Previous/Next navigation
- Scroll-to-bottom detection that enables the "I agree" checkbox
- A dedicated signature phase with summary checklist, visual signature line, date, and legal disclaimer
- When only one document exists, show the signature block inline below it (no separate phase)
- Serif font for document body text
- Keep all existing API logic, state management, and error handling unchanged

**Non-Goals:**
- Changing the API route or backend logic
- Adding document PDF generation or print support
- Adding an admin preview of the student-facing legal flow
- Animations beyond Tailwind transitions

## Decisions

### Decision 1: Component-internal phase state over route changes

Adding a `mode: 'review' | 'sign'` state variable keeps the flow within one component. This avoids splitting into multiple onboarding steps (which would require changes to `onboarding/page.tsx` and its step management).

When `docs.length === 1`, the signature block renders inline below the single document without a separate phase — `mode` stays `'review'` and the signature form is conditionally shown after the doc is agreed to.

### Decision 2: Scroll detection via onScroll + ref

A `ref` on the document container with an `onScroll` handler checks if `scrollTop + clientHeight >= scrollHeight - 5` (within 5px tolerance). When reached, a `scrolledBottom` flag is set. The checkbox `disabled` attribute depends on this flag:

```tsx
const docRef = useRef<HTMLDivElement>(null);
const [scrolledBottom, setScrolledBottom] = useState(false);

function handleScroll() {
  const el = docRef.current;
  if (!el) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
    setScrolledBottom(true);
  }
}
```

When the user navigates to a new document, `scrolledBottom` resets to `false`.

### Decision 3: Progress indicator uses dot navigation

Simple dots (● ○) showing current position. Clickable dots allow jumping to any document (but only if it's already been reviewed — or all dots are clickable since there's no review requirement beyond scrolling). Actually, all dots can be clickable for convenience — the user can jump to any document at any time.

### Decision 4: Signature block design

The signature block renders after all documents have been agreed to. It includes:
- A checklist summary of agreed documents (✓ check marks)
- The name input field
- A visual signature line: a horizontal rule with "X" and the typed name below it, plus "Electronic Signature" and the current date
- Legal disclaimer: "By typing your name and clicking the button below, you are electronically signing all documents listed above."
- The submit button: "Sign All Documents" (plural) or "Sign Document" (singular)

### Decision 5: Date display uses client time for preview

The date shown in the signature block is `new Date().toLocaleDateString()` — this is a visual preview. The actual `signature_timestamp` is recorded server-side with the real server clock when the API route processes the request. This avoids confusion between what the user sees and what's recorded.

## Risks / Trade-offs

- **Scroll detection may not trigger on short documents**: If a document is shorter than the container height, there's nothing to scroll. → Mitigation: If `scrollHeight <= clientHeight`, auto-set `scrolledBottom = true` (the entire document is visible).
- **Progress dots may be confusing with many documents**: Currently there are only 2-3 legal documents. Not a concern at this scale. → No mitigation needed.
- **Signature phase adds one extra click**: The old flow was "check boxes → type name → submit." Now it's "review docs → click Sign → type name → submit" — one extra interaction. → Mitigation: The single-document shortcut eliminates this for the common 1-doc case.
