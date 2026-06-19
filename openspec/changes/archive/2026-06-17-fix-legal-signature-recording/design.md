## Context

`legal-waiver.tsx` calls `supabase.from('students').update(...)` directly from the browser with `signature_ip: 'client'` (hardcoded placeholder) and `signature_timestamp: new Date().toISOString()` (client clock). The `agreed` Set tracking per-document checkbox state is discarded on submit — only `legal_signature` (name string) is persisted on the `students` row. There is no server-side involvement in signature capture.

## Goals / Non-Goals

**Goals:**
- Capture the real client IP address via `x-forwarded-for` on the server
- Use server-side time for `signature_timestamp`
- Persist per-document acceptance records in a new `student_legal_acceptances` table
- Move signature writes from client-side Supabase to a server-side API route
- Keep the `students.legal_signature` column (stores the typed name) for backward compatibility

**Non-Goals:**
- Admin view of per-student acceptances (future enhancement)
- Document version tracking (storing a snapshot of document content at acceptance time)
- Audit log integration beyond the new table
- Changing the legal-waiver UI or its document rendering

## Decisions

### Decision 1: Server-side API route over inline RPC

The fix requires a server-side endpoint to access `request.headers`. A Next.js API route (`POST /api/onboarding/legal-signature`) is the simplest approach:

```ts
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? '0.0.0.0';
```

**Alternative considered:** A Supabase RPC (SECURITY DEFINER) with `inet_client_addr()` could capture the database connection IP, but Vercel + Supabase means the connection IP is a Vercel edge node, not the real client. `x-forwarded-for` from the Next.js request is the only reliable source.

### Decision 2: New junction table over JSON column

A `student_legal_acceptances` table is proper relational design — queryable, indexable, and enforces referential integrity:

```sql
CREATE TABLE student_legal_acceptances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, document_id)
);
```

**Alternative considered:** A JSONB array column on `students` (e.g., `accepted_document_ids`). Simpler schema but not queryable per-document, no FK integrity, harder to join for admin views later.

### Decision 3: Upsert for re-acceptance

If a student re-takes onboarding (re-registers), they get a new `students.id`. The old acceptance records remain on the old student row (linked via `previous_student_id`). The API uses `insert` (not upsert) because each signing is a fresh student row. The `UNIQUE(student_id, document_id)` constraint prevents accidental duplicates.

### Decision 4: Keep existing `students` signature columns

The `legal_signature`, `signature_ip`, `signature_timestamp` columns on `students` are preserved. The API route updates them with real values. This maintains backward compatibility — any existing code that reads these columns continues to work. The new `student_legal_acceptances` table is additive.

## Risks / Trade-offs

- **Vercel proxies may mask real IP**: `x-forwarded-for` can contain multiple IPs if behind multiple proxies. → Mitigation: Take the first (leftmost) IP which is the original client. Fallback to `x-real-ip` or `'0.0.0.0'`.
- **Onboarding is unauthenticated**: The API route doesn't have a JWT to verify the caller. → Mitigation: The route only updates rows for the provided `studentId`. A malicious caller could only modify a student they know the UUID for. RLS on the `students` table allows the update (pending students are writable by anon during onboarding).
- **`register_onboarding_student` RPC resets signature fields**: On re-registration, the RPC sets `legal_signature = NULL, signature_ip = NULL, signature_timestamp = NULL` on the new row (line 246-248 in migration 001). This is correct behavior — the new enrollment starts fresh.

## Open Questions

None.
