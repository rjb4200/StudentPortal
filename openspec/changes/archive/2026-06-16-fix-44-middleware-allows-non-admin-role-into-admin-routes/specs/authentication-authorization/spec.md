## MODIFIED Requirements

### Requirement: Role-based access control
The system SHALL distinguish between student, preceptor, and admin roles. Admin accounts SHALL have full access to `/admin` and all admin data. Preceptor accounts SHALL NOT access `/admin`; they SHALL access only the Preceptor area when that area exists. Admin accounts SHALL also be allowed to open the Preceptor area for oversight and troubleshooting. Student accounts SHALL only access `/dashboard` and their own data.

#### Scenario: Student accesses admin route
- **WHEN** a student attempts to navigate to `/admin`
- **THEN** the system returns a 403 Forbidden response or redirects away from `/admin`

#### Scenario: Preceptor accesses admin route
- **WHEN** a preceptor attempts to navigate to `/admin` or any `/admin/*` route
- **THEN** the system denies access before rendering admin UI

#### Scenario: Admin accesses admin route
- **WHEN** an authenticated admin navigates to `/admin`
- **THEN** the admin command center is rendered

#### Scenario: Preceptor accesses preceptor route
- **WHEN** an authenticated preceptor navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin accesses preceptor route
- **WHEN** an authenticated admin navigates to `/preceptor`
- **THEN** the Preceptor area is rendered

#### Scenario: Admin API rejects non-admin roles
- **WHEN** a preceptor, student, unauthenticated user, or any non-admin role calls an `/api/admin/*` route
- **THEN** the API returns a forbidden response and does not perform the admin action
