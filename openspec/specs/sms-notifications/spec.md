# sms-notifications Specification

## Purpose

Server-side SMS notification queueing, delivery, logging, consent enforcement, and Twilio integration.
## Requirements
### Requirement: Server-side Twilio SMS delivery
The system SHALL send SMS messages through Twilio only from server-side code using server-only environment variables for the Twilio account SID, auth token, and sender phone number. Twilio credentials MUST NOT be exposed to browser code or `NEXT_PUBLIC_*` environment variables.

#### Scenario: SMS sent through server utility
- **WHEN** the SMS processor sends a queued SMS notification
- **THEN** the system calls Twilio from server-side code using server-only credentials
- **AND** the browser receives no Twilio credentials or provider authentication material

#### Scenario: Twilio is not configured
- **WHEN** SMS delivery is attempted without the required Twilio environment variables
- **THEN** the notification attempt is marked failed with a configuration error
- **AND** no client-side code receives Twilio credential names or values

### Requirement: SMS queue and delivery logging
The system SHALL store each SMS notification as a durable queue/log record with recipient type, recipient id when available, normalized phone number, notification type, channel, message body, send time, sent time, status, provider, provider message id, error message, attempt count, and timestamps.

#### Scenario: Notification queued
- **WHEN** an eligible event creates an SMS notification
- **THEN** a queue record is inserted with `channel = 'sms'`, `status = 'pending'`, a non-empty message body, and a `send_at` timestamp

#### Scenario: Delivery succeeds
- **WHEN** Twilio accepts a queued SMS message
- **THEN** the queue record is updated to `status = 'sent'`
- **AND** the provider message id and sent timestamp are recorded

#### Scenario: Delivery fails
- **WHEN** Twilio rejects a queued SMS message or the request fails
- **THEN** the queue record records the failure status, error message, last attempt timestamp, and incremented attempt count

### Requirement: SMS consent and phone validation
The system SHALL only enqueue SMS notifications for recipients with SMS opt-in enabled, a usable phone number, and enabled SMS settings for the notification type. The system SHALL validate and normalize destination phone numbers before sending.

#### Scenario: Opted-in student receives queued SMS
- **WHEN** a student has `sms_opt_in = true`, a valid phone number, and the relevant SMS setting is enabled
- **THEN** the system may enqueue SMS notifications for that student

#### Scenario: Student not opted in
- **WHEN** a student does not have `sms_opt_in = true`
- **THEN** the system does not enqueue student SMS notifications for that student

#### Scenario: Invalid phone number
- **WHEN** a queued SMS has a destination phone number that cannot be normalized for Twilio delivery
- **THEN** the system marks the notification failed with a validation error and does not call Twilio

### Requirement: SMS content safety
The system SHALL identify SMS messages as WFD EMS Student Portal messages and SHALL NOT include protected medical, clinical, or sensitive private details in SMS message bodies.

#### Scenario: Shift approval SMS content
- **WHEN** a student shift approval SMS is generated
- **THEN** the message identifies WFD EMS Student Portal and includes only schedule date/time context and general portal instructions

#### Scenario: Flagged evaluation admin SMS content
- **WHEN** an admin flagged-evaluation SMS alert is generated
- **THEN** the message identifies WFD EMS Student Portal and avoids clinical narrative, private comments, or detailed evaluation content
