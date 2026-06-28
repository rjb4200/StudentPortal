# legal-signature-token-verification Specification

## Purpose
Onboarding session token verification in the legal-signature API route to prevent student impersonation and forged legal signatures.

## Requirements

### Requirement: Legal signature route verifies onboarding session token
The `/api/onboarding/legal-signature` route SHALL verify the `onboardingToken` field against the student's active onboarding session before recording legal acceptances.

#### Scenario: Token matches active session
- **WHEN** the route receives a valid `studentId` and `onboardingToken` that hashes to a matching `onboarding_sessions` record that is not expired and not completed
- **THEN** the route proceeds to record legal acceptances and update the student's signature fields

#### Scenario: Token does not match any session
- **WHEN** the route receives a `studentId` and `onboardingToken` that does not match any active session
- **THEN** the route returns 403 with an error message directing the student to restart registration

#### Scenario: Session has expired
- **WHEN** the route receives a valid token but the matching `onboarding_sessions` record has `expires_at` in the past
- **THEN** the route returns 403

#### Scenario: Session already completed
- **WHEN** the route receives a valid token but the matching `onboarding_sessions` record has a non-null `completed_at`
- **THEN** the route returns 409

### Requirement: Onboarding token included in validation schema
The `legalSignatureBody` Zod schema SHALL include an `onboardingToken` field that is a string between 32 and 256 characters.

#### Scenario: Token missing from request body
- **WHEN** a caller POSTs to `/api/onboarding/legal-signature` without an `onboardingToken` field
- **THEN** the route returns 400 with a validation error
