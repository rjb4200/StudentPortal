## 1. Postal Lookup

- [x] 1.1 Add shared US ZIP and state validation, including tests for five-digit and ZIP+4 formats.
- [x] 1.2 Add a server-side ZIP lookup route with normalized responses and provider-failure handling.
- [x] 1.3 Add route tests for successful lookup, unknown ZIP, invalid ZIP, and provider unavailability.

## 2. TEI Address Entry

- [x] 2.1 Replace new-TEI free-text State entry with the supported state selector.
- [x] 2.2 Trigger ZIP lookup on valid ZIP blur, autofilling only an empty City field and selecting State.
- [x] 2.3 Show and apply a City/State suggestion when City already contains a value.
- [x] 2.4 Present lookup and postal-format errors accessibly without preventing manual correction.

## 3. Verification

- [x] 3.1 Add focused form behavior coverage and run the relevant test suite.
- [x] 3.2 Run `npm run build`.
