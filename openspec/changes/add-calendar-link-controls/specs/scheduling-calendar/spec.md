## ADDED Requirements

### Requirement: Token-based iCal feed endpoint
The system SHALL serve iCal feeds at `GET /api/calendar/{token}.ics` by looking up the token in the `calendar_feeds` table. Based on `feed_type`, the endpoint SHALL return the appropriate feed: `student` returns only that student's approved schedules, `training_site` returns all approved schedules for students linked to that training site, and `aggregate` returns all approved schedules across all students and sites. The endpoint SHALL return 404 when the token is not found or has been revoked.

#### Scenario: Student token returns personal feed
- **WHEN** a calendar client requests `GET /api/calendar/{token}.ics` with a valid `student`-type token
- **THEN** the response is a valid iCal feed containing only the associated student's approved schedules

#### Scenario: Training site token returns site-wide feed
- **WHEN** a calendar client requests `GET /api/calendar/{token}.ics` with a valid `training_site`-type token
- **THEN** the response is a valid iCal feed containing approved schedules for all students linked to that training site

#### Scenario: Aggregate token returns all schedules
- **WHEN** a calendar client requests `GET /api/calendar/{token}.ics` with a valid `aggregate`-type token
- **THEN** the response is a valid iCal feed containing all approved schedules across all students and sites

#### Scenario: Revoked token returns 404
- **WHEN** a calendar client requests `GET /api/calendar/{token}.ics` with a token that has been revoked
- **THEN** the endpoint returns HTTP 404

### Requirement: Legacy student-ID feed preserved
The system SHALL continue serving the existing `GET /api/calendar/{studentId}.ics` endpoint using the raw student UUID for lookup, without requiring a `calendar_feeds` token. The behavior, response format, and schedule filtering of this endpoint SHALL be identical to before this change.

#### Scenario: Legacy student feed unchanged
- **WHEN** a student copies their calendar link from the student dashboard and subscribes in a calendar client
- **THEN** the feed is served exactly as it was before the introduction of token-based feeds
