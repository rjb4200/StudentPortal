## ADDED Requirements

### Requirement: Shift modal includes date picker
The shift request modal SHALL include a native `<input type="date">` element that allows students to select or change the shift date before submitting the request.

#### Scenario: Date picker defaults to pre-selected date
- **WHEN** the shift modal opens with a pre-selected date (today or class start date)
- **THEN** the date picker displays that date as its current value
- **AND** the modal title reads "Request Shift" without displaying the date inline

#### Scenario: Date picker constrained to class window
- **WHEN** the student has a defined class ride-time window (`classStartDate` to `rideTimeEndDate`)
- **THEN** the date picker's `min` attribute is set to `classStartDate`
- **AND** the date picker's `max` attribute is set to `rideTimeEndDate`
- **AND** dates outside this range are not selectable

#### Scenario: No class window constraint
- **WHEN** the student has no defined class ride-time window
- **THEN** the date picker has no `min` or `max` constraints
- **AND** any future date is selectable (past dates disabled by browser default)

#### Scenario: Date change syncs to parent
- **WHEN** the student selects a different date in the picker
- **THEN** the parent dashboard's `selectedDate` state updates via the `onDateChange` callback
- **AND** the submit handler uses the updated date when confirming the request

### Requirement: Schedule toolbar does not duplicate CTA
The schedule section toolbar on the dashboard SHALL NOT include a "Schedule a Shift" button. The primary CTA for scheduling SHALL be in the hero command bar.

#### Scenario: Toolbar shows only view toggles
- **WHEN** a certified student navigates to the Schedule tab
- **THEN** the section toolbar displays Calendar/List toggle buttons only
- **AND** no "Schedule a Shift" button appears in the toolbar
