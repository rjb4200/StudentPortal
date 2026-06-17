## 1. Core Implementation

- [x] 1.1 Import `to24Hour` from `@/lib/time-formats` in `src/lib/ical.ts`
- [x] 1.2 Add helper function `addOneDay(dateStr: string): string` that takes `YYYYMMDD` and returns `YYYYMMDD` for the next calendar day
- [x] 1.3 Modify the event generation loop in `generateICalFeed()`: when `s.start_time` and `s.end_time` are both present, emit `DTSTART;TZID=America/New_York:YYYYMMDDTHHMMSS` and `DTEND;TZID=America/New_York:YYYYMMDDTHHMMSS` using `to24Hour()` for time conversion
- [x] 1.4 Implement overnight detection: if `end24 <= start24`, advance the end date by one day using `addOneDay()`
- [x] 1.5 Keep `VALUE=DATE` fallback when `start_time` or `end_time` is null/undefined

## 2. Verification

- [x] 2.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 2.2 Verify the generated iCal output contains `TZID=America/New_York:...T...` format for records with times
- [x] 2.3 Verify overnight shifts (Night, Full) have end date advanced by one day
- [x] 2.4 Verify same-day shifts (Day, Custom) have matching start and end dates
- [x] 2.5 Verify records without times still use `VALUE=DATE` format


