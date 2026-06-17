## MODIFIED Requirements

### Requirement: System health heartbeat
A health check endpoint SHALL perform a database read query. If the database query times out or fails, the system SHALL return an unhealthy response without attempting Pushover push notification delivery.

#### Scenario: Healthy database response
- **WHEN** the health endpoint is called and the database responds within the timeout
- **THEN** a 200 OK response is returned with database status

#### Scenario: Database timeout returns unhealthy response
- **WHEN** the health endpoint is called and the database query times out
- **THEN** the endpoint returns a 500 response with unhealthy database status
- **AND** no Pushover notification is sent

#### Scenario: Database failure returns unhealthy response
- **WHEN** the health endpoint is called and the database query fails
- **THEN** the endpoint returns a 500 response with the failure details
- **AND** no Pushover notification is sent
