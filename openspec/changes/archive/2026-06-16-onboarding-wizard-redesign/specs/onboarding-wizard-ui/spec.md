## ADDED Requirements

### Requirement: Guided wizard stepper with progress tracking
The onboarding page SHALL display a horizontal stepper showing all 5 steps (Register, Legal, Resources, Review, Submitted) with step numbers, titles, and descriptions. The stepper SHALL show the current step as active (crimson), completed steps as done (sage-green with checkmark), and future steps as pending (gray). A progress bar with percentage SHALL be visible below the stepper indicating overall completion.

#### Scenario: Student begins onboarding
- **WHEN** a student first navigates to `/onboarding`
- **THEN** the stepper shows step 1 (Register) as active, steps 2–5 as pending, and the progress bar reads "Step 1 of 5 — 0% complete"

#### Scenario: Student advances through steps
- **WHEN** a student completes step 2 (Legal) and advances to step 3 (Resources)
- **THEN** the stepper shows steps 1–2 with checkmarks in sage-green, step 3 active in crimson, steps 4–5 pending in gray, and the progress bar reads "Step 3 of 5 — 60% complete"

#### Scenario: Student completes all steps
- **WHEN** a student completes step 5 (Submitted)
- **THEN** the stepper shows all 5 steps with checkmarks in sage-green and the progress bar reads "Step 5 of 5 — 100% complete"

### Requirement: Mobile-adaptive stepper
On viewports narrower than 640px, the system SHALL collapse the horizontal stepper into a single compact bar displaying the current step number, total step count, step title, and a progress bar.

#### Scenario: Mobile viewport shows compact stepper
- **WHEN** a student views the onboarding page on a screen narrower than 640px
- **THEN** the stepper displays "Step 2 of 5" with the current step title ("Legal Agreements") and a horizontal progress bar instead of five individual step circles

#### Scenario: Desktop viewport shows full stepper
- **WHEN** a student views the onboarding page on a screen 640px or wider
- **THEN** the stepper displays all five step circles with labels and connector bars

### Requirement: WFD intro hero section
The onboarding page SHALL display a branded intro section before the stepper on step 1. The intro SHALL include the department name, a welcome message explaining the onboarding purpose, the estimated completion time, and a call-to-action button to begin registration.

#### Scenario: Intro hero is shown on first visit
- **WHEN** a student navigates to `/onboarding` with no saved session
- **THEN** the intro hero is displayed with WFD branding, a welcome message, estimated time ("~10 minutes"), and a "Begin Registration" button

#### Scenario: Intro hero is hidden after starting
- **WHEN** a student clicks "Begin Registration" or resumes a saved session beyond step 1
- **THEN** the intro hero is not displayed and the stepper with step content is shown directly

#### Scenario: Intro hero is hidden for returning students
- **WHEN** a student returns to `/onboarding` with a saved session at step 3
- **THEN** the intro hero is not displayed; the stepper resumes at step 3

### Requirement: Help and contact information on every step
Each onboarding step SHALL include accessible help information with at least an instructor contact reference or email address so students can seek assistance without leaving the onboarding flow.

#### Scenario: Help information is visible on step cards
- **WHEN** a student is on any onboarding step
- **THEN** the step card includes help text with a contact email or instructor reference (e.g., "Need help? Contact your instructor or email training@winchesterfire.org")

### Requirement: Back navigation between steps
The system SHALL provide a "Previous Step" button on steps 2, 3, and 4 allowing students to return to the prior step. Steps 1 and 5 SHALL NOT display a back button.

#### Scenario: Student navigates back from step 3
- **WHEN** a student on step 3 (Resources) clicks the "Previous Step" button
- **THEN** the stepper returns to step 2 (Legal) and the Legal Waiver component is displayed

#### Scenario: Back button is not shown on step 1
- **WHEN** a student is on step 1 (Register)
- **THEN** no "Previous Step" button is displayed

#### Scenario: Back button is not shown on step 5
- **WHEN** a student is on step 5 (Submitted)
- **THEN** no "Previous Step" button is displayed

### Requirement: WFD design language applied to step cards
Step content cards SHALL use WFD-inspired design patterns including a crimson bottom-border underline on the step title, an amber-left-border notice banner for important messages, and hover-lift effects on interactive elements.

#### Scenario: Step title displays WFD underline
- **WHEN** a step card is rendered
- **THEN** the step title heading has a crimson 2px bottom border

#### Scenario: Important notice displays amber accent
- **WHEN** a step card displays an important informational message
- **THEN** the message is rendered with an amber left border and light yellow background

### Requirement: Remove unused legacy quiz components
The system SHALL NOT include the unused quiz components `mcq-section.tsx`, `image-grid-quiz.tsx`, and `hotspot-quiz.tsx` as they are dead code replaced by the inline photo-selection quiz in `knowledge-gate.tsx`.

#### Scenario: Legacy components are not importable
- **WHEN** a developer searches for `mcq-section`, `image-grid-quiz`, or `hotspot-quiz` in the codebase
- **THEN** no file or import reference to these components exists
