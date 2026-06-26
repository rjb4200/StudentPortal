## 1. ShiftModal — Add date picker

- [x] 1.1 Add `schedules`, `classStartDate`, `rideTimeEndDate`, and `onDateChange` props to ShiftModal interface
- [x] 1.2 Add internal `selectedDate` state (initialized from `date` prop) and sync via `onDateChange`
- [x] 1.3 Add `<input type="date">` element with `min={classStartDate}`, `max={rideTimeEndDate}`, styled to match existing form inputs
- [x] 1.4 Change modal title from `Request Shift — {date}` to `Request Shift` (date now shown in picker)

## 2. Dashboard — Remove duplicate button and wire new props

- [x] 2.1 Remove the "Schedule a Shift" `<Button>` from the schedule section toolbar (line ~412)
- [x] 2.2 Pass `schedules`, `classStartDate`, `rideTimeEndDate`, and `onDateChange={setSelectedDate}` to `<ShiftModal>`

## 3. Verification

- [x] 3.1 Run `npm run build` to confirm no compilation errors
