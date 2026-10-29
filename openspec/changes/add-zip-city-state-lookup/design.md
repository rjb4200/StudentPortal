## Context

The new-TEI form currently accepts unstructured City, State, and ZIP text. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Keep address entry quick while preventing invalid State and ZIP formats.
- Obtain ZIP-derived City and State data without exposing the external provider directly to the browser.
- Preserve registrant-entered City data when it conflicts with or differs from a postal preference.

**Non-Goals:**
- Validate street deliverability, geocode addresses, or replace the registrant's address with a postal-standardized address.
- Change persisted address columns or existing TEI records.

## Decisions

### Server-side provider boundary

Expose a same-origin lookup route that accepts only normalized valid US ZIP input and returns a minimal `{ city, state }` result. It calls a ZIP-data provider server-side and can cache successful results briefly. This avoids browser-level coupling, makes provider replacement possible, and limits external requests.

Use a public ZIP-data provider initially rather than a paid address-validation service because the product needs postal-place suggestions, not deliverability validation. The route must convert provider failures into a stable not-found or unavailable response.

### Non-destructive autofill

On ZIP-field blur, call the lookup route after client-side ZIP format validation. Always select the lookup State on success. If City is blank, fill it; otherwise show a clickable `Use <city>, <state>` suggestion. City remains editable because valid ZIP codes can have postal aliases or multiple local names.

### Validation ownership

Share ZIP-format and supported-state validation between the client step checks and server registration route. The lookup improves entry but does not replace server-side validation.

## Risks / Trade-offs

- [Public provider availability or changed response] → Hide the provider behind the same-origin route and fail without blocking valid manual address entry beyond format validation.
- [Multiple cities for one ZIP] → Return the provider's primary city as a suggestion, never as an irreversible replacement.
- [Unnecessary lookups] → Trigger only after blur of a syntactically valid ZIP and cache results.

## Migration Plan

Deploy the lookup route and form changes together. No database migration is required. If the provider is unavailable, retain manual City entry and state selection while lookup feedback reports the temporary failure.
