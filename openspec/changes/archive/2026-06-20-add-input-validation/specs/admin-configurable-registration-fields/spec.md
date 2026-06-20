## ADDED Requirements

### Requirement: Registration field type rendering

The registration form SHALL render fields according to their configured `field_type`. Fields with `field_type='email'` SHALL render as `<input type="email">` with `autoComplete="email"`. Fields with `field_type='tel'` SHALL render as `<input type="tel">` with `autoComplete="tel"`. Fields with `field_type='select'` SHALL render as a `<select>` dropdown. Fields with `field_type='textarea'` SHALL render as a `<textarea>`. All other field types SHALL render as `<input type="text">`.

#### Scenario: Email field renders as email input

- **WHEN** a registration field is configured with `field_type='email'`
- **THEN** the HTML input renders with `type="email"` and `autoComplete="email"`

#### Scenario: Unknown field type falls back to text

- **WHEN** a registration field has an unrecognized `field_type`
- **THEN** the HTML input renders as `type="text"`
