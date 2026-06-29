## Context

The admin currently has no dedicated student profile page. Students are viewed through three fragmented surfaces: an inline edit form at `/admin/accounts?edit=<id>`, a table row in the DailyOps roster, and a messaging panel. All linked data (instructors, TEIs, classes, legal documents, schedules, admin notes, quiz flags) exists in the database but is never assembled into a unified view.

The project uses Next.js 15 App Router, Supabase with three client patterns (browser, server-cookies, admin/service-role), Tailwind CSS with a custom `wfd-*` palette, and a UI component library at `src/components/ui/`. Middleware protects all `/admin/*` routes with admin role checks via `auth.jwt() -> user_metadata -> role = 'admin'`.

### Current data model (relevant subset)

```
students
├── instructor_id FK → instructors
│   └── training_site_id FK → training_sites
├── training_class_id FK → training_classes
│   ├── training_site_id FK → training_sites
│   └── instructor_id FK → instructors
├── schedules (rides) via student_id FK
├── admin_notes via student_id FK
├── student_legal_acceptances via student_id FK → legal_documents
└── quiz_flags via student_id FK
```

The `students` table also has denormalized text columns (`instructor_name`, `instructor_contact`) that predate the FK columns. Both exist simultaneously.

## Goals / Non-Goals

**Goals:**
- Create a single-page student profile at `/admin/students/[id]`
- Show all linked data (instructor, TEI, class, rides, legal docs, quiz flags, admin notes) in a progressive-disclosure layout
- Provide quick actions (email, copy, print) in the relevant sections
- Surface data completeness warnings when linked records are missing
- Support print output for individual documents and full student packet
- Log document access events for audit compliance
- Use the existing `wfd-*` color palette and UI component patterns

**Non-Goals:**
- Persistent quiz results storage (quiz data is limited to flags + completion timestamp for now)
- Replacing or removing the inline edit form in `/admin/accounts`
- Changing the data model or adding new database tables
- Modifying the student roster table itself (only the link destination changes)
- Email notification changes (existing email flows are untouched)

## Decisions

### 1. Page architecture: Server Component shell + Client Component islands

**Decision**: The page at `src/app/admin/students/[id]/page.tsx` will be an async Server Component that uses `createServerClient` (cookies) to fetch all student data in a single request. The fetched data is passed as props to client component children for interactivity (expand/collapse, forms, print).

**Rationale**: The middleware already verifies admin auth. A server component avoids a loading spinner flash, enables parallel data fetching, and keeps sensitive queries server-side. Client components handle only UI interaction (expand/collapse, notes form, print triggers).

**Alternatives considered**:
- All-client-component: Simpler but adds a loading state and exposes query patterns to the client. Rejected because we already have server-side auth in middleware.
- API-route-based fetching: Adds unnecessary network hops when the data is needed for a single page render.

### 2. Expandable sections: Custom Disclosure component

**Decision**: Build a new `Disclosure` component in `src/components/ui/` that uses `useState` for open/close state and CSS transitions for smooth animation. Each section (Instructor, TEI, Class) is a `Disclosure` instance.

**Rationale**: HTML `<details>`/`<summary>` elements provide native expand/collapse but have no animation control and inconsistent styling across browsers. A custom component gives full control over the transition, the chevron rotation, and the collapsed summary content.

**Alternatives considered**:
- Headless UI `Disclosure`: Adds a dependency. Our UI needs are simple enough to build in-house.
- `<details>`: No animation, poor styling control. Rejected.

```tsx
// Proposed API
<Disclosure
  title="Instructor"
  summary="Dr. John Adams — Active"
  defaultOpen={false}
>
  {/* detail content */}
</Disclosure>
```

### 3. Data fetching strategy: Server-side Supabase join

**Decision**: Use Supabase's nested select to fetch the student with all joined data in one query:

```ts
const { data: student } = await supabase
  .from('students')
  .select(`
    *,
    instructors(*),
    training_sites(*),
    training_classes(*, training_sites(*), instructors(*)),
    schedules(*),
    admin_notes(*),
    student_legal_acceptances(*, legal_documents(*)),
    quiz_flags(*)
  `)
  .eq('id', id)
  .single();
```

**Rationale**: A single query is more efficient than multiple round-trips. The joined data is read-only display data (no mutations on the profile page except admin notes), so eager loading is appropriate.

**Trade-off**: The `schedules` and `admin_notes` arrays could grow large for active students. For Phase 1, we accept this. If performance becomes an issue, we can add server-side pagination or a `limit` to those sub-queries later.

### 4. Admin notes: Client-side API routes

**Decision**: Admin notes CRUD uses client-side fetch to `POST /api/admin/students/[id]/notes` and `DELETE /api/admin/students/[id]/notes`. These API routes use the admin client (service role) to bypass RLS.

**Rationale**: Notes mutation needs to happen after the page loads, so it can't be server-side. Using API routes (rather than direct Supabase calls from the client) keeps the service-role key server-side and allows validation.

**Alternatives considered**:
- Server Actions: Next.js' built-in mechanism for mutations. Could work but the codebase has no existing Server Action patterns. Using API routes is consistent with the rest of the admin backend.

### 5. Print support: @media print CSS

**Decision**: Use a print stylesheet (`@media print`) to hide navigation, action buttons, and UI chrome when the user prints. All expandable sections are forced to expanded state in print. The full packet "print" triggers `window.print()` after briefly toggling a CSS class that expands all sections.

**Rationale**: No server-side PDF generation needed. No new dependencies. Works with the browser's native print dialog, which already supports "Save as PDF."

**Trade-off**: Print layout quality depends on the browser's print engine. For a future phase, a server-side PDF generation (e.g., Puppeteer or jsPDF) could be added for more control.

### 6. Audit logging: Reuse existing auditLog utility

**Decision**: Document view and print events call the existing `auditLog()` function from `src/lib/audit.ts`, which inserts into the `audit_log` table via the admin client. The action strings use a structured format: `viewed_legal_document` and `printed_legal_document`.

**Rationale**: The `audit_log` table and helper already exist. Adding structured action strings is a minimal extension.

### 7. Data completeness checks: Server-computed, client-displayed

**Decision**: The server component computes completeness warnings from the fetched data and passes them as a `warnings: string[]` prop to the client. The client renders a warning banner component.

**Checks performed**:
| Condition | Warning |
|-----------|---------|
| `training_site_id` is null | "No TEI / Training Site assigned" |
| `instructor_id` is null | "No instructor linked" |
| `instructors.phone` is null or empty | "Instructor phone number missing" |
| `student_legal_acceptances` is empty | "No signed legal documents" |
| `onboarding_completed_at` is null | "Onboarding test not completed" |
| `training_class_id` is null | "No class association found" |

### 8. Route and file layout

```
src/app/admin/students/
└── [id]/
    └── page.tsx                    # Server Component: data fetch + shell
src/components/admin/
├── student-profile/
│   ├── student-summary-card.tsx    # Status card (Client)
│   ├── instructor-section.tsx     # Expandable instructor (Client)
│   ├── tei-section.tsx            # Expandable TEI (Client)
│   ├── class-section.tsx          # Expandable class (Client)
│   ├── legal-documents-section.tsx # Legal docs table + view/print (Client)
│   ├── admin-notes-section.tsx    # Notes CRUD (Client)
│   ├── onboarding-test-section.tsx # Quiz status + flags (Client)
│   ├── ride-history-section.tsx   # Schedules table (Client)
│   ├── completeness-warnings.tsx  # Warning banners (Client)
│   └── print-packet-button.tsx    # Full packet print trigger (Client)
src/components/ui/
└── disclosure.tsx                  # Reusable expandable section
src/app/api/admin/students/
└── [id]/
    └── notes/
        └── route.ts               # POST (create) and DELETE handlers
```

### 9. Roster link change

In `src/components/admin/daily-ops.tsx` line 532, change:
```tsx
<a href={`/admin/accounts?edit=${s.id}`}>
```
to:
```tsx
<a href={`/admin/students/${s.id}`}>
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Large schedules/admin_notes arrays could slow page load | Accept for Phase 1. Add `order('created_at', { ascending: false }).limit(50)` if needed later |
| Print layout fragile across browsers | Test in Chrome + Firefox. Use simple print CSS (no flexbox/grid tricks in print) |
| Denormalized `instructor_name` on students may differ from FK-resolved instructor record | Display the FK-resolved record primarily. Show denormalized text only when FK is null, with a warning |
| Student has `instructor_id` but the instructor row was deleted | Handle null FK resolution gracefully — show "Instructor record not found" |
| No quiz results table means "printable test with timestamps" is limited to flags + completion date | Deferred — this is a future change to add `student_quiz_attempts` table |

## Open Questions

- **Instructor profile link**: The `instructors` table is managed through Registry, but there's no dedicated instructor detail page. Should the "Open Instructor Profile" link navigate to the Registry tab with that instructor pre-selected, or be a future route?
- **Print packet PDF naming**: Should the printed packet include a generated document title/header, or rely on the user's browser "Save as PDF" naming?
