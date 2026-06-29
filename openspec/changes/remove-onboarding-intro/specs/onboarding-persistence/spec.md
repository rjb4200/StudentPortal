## MODIFIED Requirements

### Requirement: Resume saved onboarding session
The system SHALL check for a saved `wfd_onboarding_session` in localStorage on page load. If a session exists and is less than 24 hours old, the system SHALL display a resume prompt allowing the student to continue from the saved step or start over. If no valid session exists, the system SHALL display step 1 registration directly.

#### Scenario: Resume prompt shown for valid session
- **WHEN** a student navigates to `/onboarding` and a `wfd_onboarding_session` exists in localStorage with a timestamp less than 24 hours old
- **THEN** the system displays a prompt: "You have an incomplete onboarding session. Would you like to resume?" with "Resume" and "Start Over" buttons

#### Scenario: Student chooses to resume
- **WHEN** a student clicks "Resume" on the resume prompt
- **THEN** the stepper advances to the saved `currentStep`, the saved `studentId` and `email` are restored to React state, and the onboarding flow displays the saved step

#### Scenario: Student chooses to start over
- **WHEN** a student clicks "Start Over" on the resume prompt
- **THEN** the `wfd_onboarding_session` key is removed from localStorage and the onboarding flow SHALL display step 1 registration with the 5-step stepper visible

#### Scenario: Expired session is ignored
- **WHEN** a student navigates to `/onboarding` and the saved session timestamp is more than 24 hours old
- **THEN** the session SHALL be treated as expired, the key SHALL be removed from localStorage, and step 1 registration with the 5-step stepper SHALL be displayed

#### Scenario: No saved session exists
- **WHEN** a student navigates to `/onboarding` and no `wfd_onboarding_session` key exists in localStorage
- **THEN** step 1 registration with the 5-step stepper SHALL be displayed

### Requirement: Visual stepper displays all five onboarding steps
The system SHALL render a 5-step visual stepper (Register, Legal, Resources, Review, Submitted) visible at all times above the step content, with completed steps shown in sage-green with checkmarks, the current step in crimson, and future steps in gray.

#### Scenario: Stepper visible on steps 1 through 5
- **WHEN** a student is on any step from 1 (Register) through 5 (Submitted)
- **THEN** the 5-step stepper SHALL be rendered above the step content showing the current step as active

#### Scenario: Stepper visible on fresh onboarding
- **WHEN** a student first arrives at `/onboarding` with no saved session
- **THEN** step 1 registration SHALL be displayed with the 5-step stepper visible

#### Scenario: Stepper shows final step on completion
- **WHEN** a student reaches step 5 (Submitted)
- **THEN** the stepper SHALL show steps 1-4 as completed (sage-green checkmarks) and step 5 as active (crimson), with the progress bar at 100%

#### Scenario: Mobile stepper shows compact bar
- **WHEN** the viewport width is below 640px
- **THEN** the desktop stepper (5 circles) SHALL be hidden and a compact mobile stepper bar SHALL be displayed showing "Step X of 5", the step label, and a progress bar

#### Scenario: Mobile stepper shows final step
- **WHEN** on a mobile viewport and the student reaches step 5 (Submitted)
- **THEN** the mobile stepper SHALL show "Step 5 of 5", 100% complete, with the label "Submitted"
