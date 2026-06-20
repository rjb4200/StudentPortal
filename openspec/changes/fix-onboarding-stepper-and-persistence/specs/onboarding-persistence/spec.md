## ADDED Requirements

### Requirement: Save onboarding progress to localStorage
The system SHALL persist the current onboarding step, student ID, email, and a timestamp to `localStorage` under the key `wfd_onboarding_session` each time the student advances to a new step. The system SHALL update the timestamp on each save.

#### Scenario: Progress is saved on registration completion
- **WHEN** a student completes the registration form and advances from step 1 to step 2
- **THEN** the `wfd_onboarding_session` key in localStorage is updated with `currentStep: 2`, `studentId`, `email`, and a current ISO-8601 timestamp

#### Scenario: Progress is saved on intermediate step advancement
- **WHEN** a student advances from step 2 to step 3 or from step 3 to step 4
- **THEN** the `wfd_onboarding_session` key is updated with the new `currentStep` and the current timestamp

#### Scenario: Progress is not saved on step 5 advancement
- **WHEN** a student advances to step 5 (Submitted)
- **THEN** the `wfd_onboarding_session` key SHALL be removed from localStorage instead of being updated

### Requirement: Resume saved onboarding session
The system SHALL check for a saved `wfd_onboarding_session` in localStorage on page load. If a session exists and is less than 24 hours old, the system SHALL display a resume prompt allowing the student to continue from the saved step or start over.

#### Scenario: Resume prompt shown for valid session
- **WHEN** a student navigates to `/onboarding` and a `wfd_onboarding_session` exists in localStorage with a timestamp less than 24 hours old
- **THEN** the system displays a prompt: "You have an incomplete onboarding session. Would you like to resume?" with "Resume" and "Start Over" buttons

#### Scenario: Student chooses to resume
- **WHEN** a student clicks "Resume" on the resume prompt
- **THEN** the stepper advances to the saved `currentStep`, the saved `studentId` and `email` are restored to React state, and the intro hero is skipped

#### Scenario: Student chooses to start over
- **WHEN** a student clicks "Start Over" on the resume prompt
- **THEN** the `wfd_onboarding_session` key is removed from localStorage and the onboarding flow SHALL display the intro hero with a fresh start at step 1

#### Scenario: Expired session is ignored
- **WHEN** a student navigates to `/onboarding` and the saved session timestamp is more than 24 hours old
- **THEN** the session SHALL be treated as expired, the key SHALL be removed from localStorage, and the intro hero with step 1 SHALL be displayed

#### Scenario: No saved session exists
- **WHEN** a student navigates to `/onboarding` and no `wfd_onboarding_session` key exists in localStorage
- **THEN** the intro hero with step 1 SHALL be displayed normally

### Requirement: Clear session on completion
The system SHALL remove the `wfd_onboarding_session` key from localStorage when the student reaches step 5 (Submitted).

#### Scenario: Session cleared on completion
- **WHEN** a student advances to step 5
- **THEN** the `wfd_onboarding_session` key SHALL be removed from localStorage

### Requirement: Visual stepper displays all five onboarding steps
The system SHALL render a 5-step visual stepper (Register, Legal, Resources, Review, Submitted) visible at all times above the step content, with completed steps shown in sage-green with checkmarks, the current step in crimson, and future steps in gray. The stepper SHALL be hidden only during the intro hero phase and SHALL reappear once the student begins registration.

#### Scenario: Stepper visible on steps 1 through 5
- **WHEN** a student is on any step from 1 (Register) through 5 (Submitted) after dismissing the intro hero
- **THEN** the 5-step stepper SHALL be rendered above the step content showing the current step as active

#### Scenario: Stepper hidden during intro hero
- **WHEN** a student first arrives at `/onboarding` with no saved session
- **THEN** the intro hero SHALL be displayed and the stepper SHALL NOT be visible until the student clicks "Begin Registration"

#### Scenario: Stepper shows final step on completion
- **WHEN** a student reaches step 5 (Submitted)
- **THEN** the stepper SHALL show steps 1-4 as completed (sage-green checkmarks) and step 5 as active (crimson), with the progress bar at 100%

#### Scenario: Mobile stepper shows compact bar
- **WHEN** the viewport width is below 640px
- **THEN** the desktop stepper (5 circles) SHALL be hidden and a compact mobile stepper bar SHALL be displayed showing "Step X of 5", the step label, and a progress bar

#### Scenario: Mobile stepper shows final step
- **WHEN** on a mobile viewport and the student reaches step 5 (Submitted)
- **THEN** the mobile stepper SHALL show "Step 5 of 5", 100% complete, with the label "Submitted"
