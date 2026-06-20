## Context

The application has no validation library and no shared validation schemas. Every form and API route does ad-hoc validation (if any) — mostly existence checks with `.trim()`. Email fields render as `type="text"`. Database columns lack check constraints on format or length.

## Goals / Non-Goals

**Goals:**
- Install Zod and create reusable validation schemas for common field types
- Fix the email field type rendering bug in the registration form
- Add server-side validation to the 5 critical API routes
- Add client-side validation before the registration RPC call
- Add database CHECK constraints for `field_type`, phone length, and comments length

**Non-Goals:**
- Validating EVERY API route (focus on critical: those that write to DB or create auth users)
- Adding validation to admin config forms (URL validation, etc.) — follow-up
- Database email format constraints (Postgres regex is complex; Zod handles it before DB)
- Validation on internal-only routes (refresh-schema, reset-test-student)
- Evaluation form client validation (ratings already have DB CHECK constraints)

## Decisions

### Decision 1: Zod over manual validation

**Chosen**: Install `zod` and define schemas in `src/lib/validation.ts`.

**Alternative considered**: Write manual validation functions for each field. Rejected — manual validation is verbose, error-prone, and doesn't compose. Zod gives us type inference, composable schemas, and standard error messages for free.

**Rationale**: Zod is the most popular validation library for TypeScript. It adds ~16KB gzipped and has zero runtime dependencies. Schemas are trivially testable.

### Decision 2: Schema design — flat object schemas per use case

Create named schemas for each API route's body rather than a monolithic "all inputs" schema. Each route imports the schema it needs.

```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const emailSchema = z.string().email().max(255).trim().toLowerCase();
export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().trim().min(1).max(100);
export const phoneSchema = z.string().trim().max(30).regex(/^[\d\s\-\(\)\+\.]{7,30}$/, 'Invalid phone number format');
export const textSchema = (maxLen: number) => z.string().trim().max(maxLen);

export const legalSignatureBody = z.object({
  studentId: uuidSchema,
  fullName: nameSchema,
  agreedDocumentIds: z.array(uuidSchema).min(1),
});

export const createAuthUserBody = z.object({
  email: emailSchema,
  password: z.string().min(6).max(128),
});

export const deleteStudentBody = z.object({
  studentId: uuidSchema,
});

export const scheduleCancelBody = z.object({
  scheduleId: uuidSchema,
  note: textSchema(500).optional(),
});

export const scheduleActionBody = z.object({
  scheduleId: uuidSchema,
  action: z.enum(['approved', 'rejected', 'cancelled']),
  note: textSchema(500).optional(),
});
```

### Decision 3: Registration form validation — client-side before RPC

Add a `validate()` function before the RPC call that checks:
- `form.full_name` matches `nameSchema`
- `form.email` matches `emailSchema`
- `form.phone` matches `phoneSchema` if present
- All text fields are trimmed and length-limited

If validation fails, set an error and block the RPC call. The Zod error message is shown to the user.

### Decision 4: Email field type fix

In `registration-form.tsx` line 158, change the fallback from `type="text"` to a proper mapping:

```
field_type='email'  → type="email"
field_type='tel'    → type="tel"
default             → type="text"
```

Also add `autoComplete` attributes for email and tel fields.

### Decision 5: Database CHECK constraints

```sql
-- Migration 017
ALTER TABLE registration_fields ADD CONSTRAINT ck_registration_fields_field_type
  CHECK (field_type IN ('text', 'email', 'tel', 'textarea', 'select'));

ALTER TABLE students ADD CONSTRAINT ck_students_phone_length
  CHECK (phone IS NULL OR length(phone) <= 30);

ALTER TABLE evaluations ADD CONSTRAINT ck_evaluations_comments_length
  CHECK (comments IS NULL OR length(comments) <= 5000);
```

## Risks / Trade-offs

- **Zod adds a dependency**: ~16KB gzipped, zero runtime deps. Acceptable for the safety gained.
- **Client-side validation can be bypassed**: The RPC `register_onboarding_student` is SECURITY DEFINER and runs server-side, but it does its own validation through the database schema. Adding Zod client-side catches errors earlier and gives better UX. Server-side validation in API routes is the real defense.
- **Phone regex is lenient**: `/^[\d\s\-\(\)\+\.]{7,30}$/` accepts a wide range of formats (US + international). Intentionally permissive — strict phone validation causes more support issues than it prevents.
