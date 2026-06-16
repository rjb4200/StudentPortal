## ADDED Requirements

### Requirement: Save onboarding progress to localStorage
The system SHALL persist the current onboarding step, student ID, email, and a timestamp to `localStorage` under the key `wfd_onboarding_session` each time the student advances to a new step. The system SHALL update the timestamp on each save.

#### Scenario: Progress is saved on step advancement
- **WHEN** a student advances from step 1 to step 2
- **THEN** the `wfd_onboarding_session` key in localStorage is updated with `currentStep: 2`, `studentId`, `email`, and a current ISO-8601 timestamp

#### Scenario: Progress is saved on intermediate step advancement
- **WHEN** a student advances from step 2 to step 3
- **THEN** the `wfd_onboarding_session` key is updated with `currentStep: 3` and the current timestamp

### Requirement: Resume saved onboarding session
The system SHALL check for a saved `wfd_onboarding_session` in localStorage on page load. If a session exists and is less than 24 hours old, the system SHALL display a resume prompt allowing the student to continue from the saved step or start over.

#### Scenario: Resume prompt shown for valid session
- **WHEN** a student navigates to `/onboarding` and a `wfd_onboarding_session` exists in localStorage with a timestamp less than 24 hours old
- **THEN** the system displays a prompt: "You have an incomplete onboarding session. Would you like to resume?" with "Resume" and "Start Over" buttons

#### Scenario: Student chooses to resume
- **WHEN** a student clicks "Resume" on the resume prompt
- **THEN** the stepper advances to the saved `currentStep`, the saved `studentId` and `email` are restored, and the intro hero is skipped

#### Scenario: Student chooses to start over
- **WHEN** a student clicks "Start Over" on the resume prompt
- **THEN** the `wfd_onboarding_session` key is removed from localStorage and the onboarding flow starts from step 1 with the intro hero

#### Scenario: Expired session is ignored
- **WHEN** a student navigates to `/onboarding` and the saved session timestamp is more than 24 hours old
- **THEN** the session is treated as expired, the key is removed from localStorage, and the intro hero with step 1 is displayed

#### Scenario: No saved session exists
- **WHEN** a student navigates to `/onboarding` and no `wfd_onboarding_session` key exists in localStorage
- **THEN** the intro hero with step 1 is displayed normally

### Requirement: Clear session on completion
The system SHALL remove the `wfd_onboarding_session` key from localStorage when the student reaches step 5 (Submitted).

#### Scenario: Session cleared on completion
- **WHEN** a student advances to step 5
- **THEN** the `wfd_onboarding_session` key is removed from localStorage
