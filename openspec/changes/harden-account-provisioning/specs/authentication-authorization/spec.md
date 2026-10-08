## ADDED Requirements

### Requirement: Orthogonal student enrollment and staff role
The system SHALL treat student status and staff role as independent dimensions of a single auth user. `app_metadata.role` SHALL remain a single capability value that acts as a ceiling, where `admin` includes all `preceptor` capabilities and `preceptor` accounts MAY also hold a student enrollment. Student access SHALL be resolved by the `students` table row whose `auth_user_id` matches the authenticated user, independent of `app_metadata.role`. Provisioning a staff account for an email that also has, or later gains, a student enrollment SHALL NOT be blocked solely because the person is a student.

#### Scenario: Admin who is also a student reaches both areas
- **WHEN** an auth user has `app_metadata.role = 'admin'` and a `students` row whose `auth_user_id` matches their user id
- **THEN** the user is authorized for `/admin` by role and for `/dashboard` by the student enrollment, and both are reachable

#### Scenario: Preceptor who is also a student reaches both areas
- **WHEN** an auth user has `app_metadata.role = 'preceptor'` and a `students` row whose `auth_user_id` matches their user id
- **THEN** the user is authorized for `/preceptor` by role and for `/dashboard` by the student enrollment

#### Scenario: Student enrollment does not grant staff access
- **WHEN** an auth user has only a `students` row and a non-staff `app_metadata.role`
- **THEN** the user is denied access to `/admin` and `/preceptor`

#### Scenario: Staff role ceiling covers preceptor capabilities
- **WHEN** an auth user has `app_metadata.role = 'admin'`
- **THEN** the user is authorized for the Preceptor area in addition to the Admin area

#### Scenario: Existing enrollment is not overwritten by provisioning
- **WHEN** a staff account is provisioned for an email that already has a linked student enrollment
- **THEN** the student enrollment and its `auth_user_id` link are preserved and the staff role does not remove student access
