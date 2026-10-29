## Why

The TEI registration form accepts free-text state and ZIP values, which permits inconsistent addresses and requires users to manually enter city and state information that can be derived from a ZIP code.

## What Changes

- Replace free-text State entry on new TEI registrations with a US state selector.
- Validate US five-digit and ZIP+4 postal codes.
- Look up ZIP codes to suggest a city and state after a valid ZIP is entered.
- Autofill empty City and State fields from a successful ZIP lookup; preserve entered City values and offer a one-click suggestion instead.

## Capabilities

### New Capabilities

- `tei-postal-address-lookup`: ZIP-based City and State suggestions for TEI registration addresses.

### Modified Capabilities

- `input-validation`: TEI registration postal fields validate US ZIP formats and selected state values.

## Impact

- TEI registration client form and validation schemas.
- A server-side postal-code lookup integration and associated tests.
