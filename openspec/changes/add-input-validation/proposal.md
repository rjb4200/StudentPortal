## Why

The application has no consistent input validation layer. Student registration sends raw form values directly to the Supabase RPC without email format checks, length limits, or sanitization. Email fields render as `type="text"` instead of `type="email"`, losing browser validation. API routes accept `request.json()` bodies with only existence checks — no UUID format validation, no length enforcement, no schema validation. The `registration_fields.field_type` column has no database check constraint. This leaves the system vulnerable to malformed data, oversized inputs, and invalid values reaching the database and downstream email templates.

## What Changes

- **Install Zod** and create `src/lib/validation.ts` with shared schemas for email, UUID, name, phone, and bounded text
- **Fix registration form rendering**: map `field_type='email'` → `type="email"` input
- **Add server-side validation** to critical API routes: legal-signature, create-auth-user, delete-student, schedule/cancel, schedule-action
- **Add client-side validation** to the registration form RPC call — validate email format, trim text, enforce length limits, validate phone format
- **Add database CHECK constraints**: `registration_fields.field_type` restricted to known values; length limits on `students.phone` and `evaluations.comments`
- Also fixes **#40** — email field does not use email input type

## Capabilities

### New Capabilities
- `input-validation`: Shared Zod-based validation schemas for all user-facing inputs; server-side API body validation; client-side registration field validation; database-level field type and length constraints

### Modified Capabilities
- `admin-configurable-registration-fields`: Registration form field rendering SHALL map `field_type='email'` to `type="email"` HTML input

## Impact

- **New dependency**: `zod` in `package.json`
- **New file**: `src/lib/validation.ts`
- **Modified**: `src/components/onboarding/registration-form.tsx`, `src/app/api/onboarding/legal-signature/route.ts`, `src/app/api/admin/create-auth-user/route.ts`, `src/app/api/admin/delete-student/route.ts`, `src/app/api/schedule/cancel/route.ts`, `src/app/api/admin/schedule-action/route.ts`
- **New migration**: CHECK constraints on `registration_fields.field_type`, `students.phone`, `evaluations.comments`
- **Zero breaking changes**: existing valid inputs pass through unchanged
