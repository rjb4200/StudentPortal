## Why

The signup form field sorting only used `sort_order`, which can produce inconsistent ordering when fields have equal sort values or when built-in and custom fields are mixed.

## What Changes

- Sort built-in fields in explicit `BUILT_IN_FIELD_KEYS` priority order first.
- Sort custom fields by `sort_order` after built-in fields.
- Use `field_key` as a deterministic tiebreaker for custom fields with equal sort_order.

## Capabilities

### New Capabilities
*(None — bug fix.)*

### Modified Capabilities
- `admin-configurable-registration-fields`: Field order is now deterministic.

## Impact

- Modified: `src/components/onboarding/registration-form.tsx` — improved sorting logic.
- No new dependencies, no database changes, no environment variable changes.
