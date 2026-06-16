# quiz-feedback-panels Specification

## Purpose
TBD - created by archiving change polish-knowledge-review-quiz. Update Purpose after archive.
## Requirements
### Requirement: Persistent incorrect-answer feedback
The system SHALL display a persistent feedback panel when a student submits an incorrect photo selection, replacing the previous auto-dismiss behavior. The panel MUST remain visible until the student explicitly navigates away via a button press.

#### Scenario: Incorrect answer shows persistent panel
- **WHEN** a student submits an incorrect photo selection for a rule
- **THEN** the system displays a persistent feedback panel that does not auto-dismiss
- **AND** the panel shows the current attempt count
- **AND** the panel remains visible until the student clicks "Review Rule" or "Retry"

#### Scenario: Feedback panel categorizes results
- **WHEN** the feedback panel is displayed after an incorrect answer
- **THEN** the panel groups photos into "Missed" (non-compliant but not selected), "Correctly identified" (non-compliant and selected), and "Incorrectly selected" (compliant but selected) categories
- **AND** each photo in every category shows a thumbnail image, its label, and its reason from the database

#### Scenario: Student returns to rule from feedback
- **WHEN** a student clicks "Review Rule" in the feedback panel
- **THEN** the system transitions back to the rule display mode for the same rule
- **AND** the selection state is cleared

#### Scenario: Student retries from feedback
- **WHEN** a student clicks "Retry" in the feedback panel
- **THEN** the system transitions back to the question mode for the same rule
- **AND** all photo selections are cleared
- **AND** the attempt counter is preserved

### Requirement: Success micro-feedback
The system SHALL display a brief success indicator when a student correctly identifies all non-compliant photos for a rule.

#### Scenario: Correct answer shows success feedback
- **WHEN** a student submits a correct photo selection
- **THEN** the system displays a "Correct!" confirmation with a checkmark for approximately 1.5 seconds
- **AND** then automatically advances to the next rule or the completion screen if no rules remain

### Requirement: Hidden labels and reasons during selection
The system SHALL hide photo labels and compliance reasons during the selection phase of each question, revealing them only after submission.

#### Scenario: Photo labels hidden during selection
- **WHEN** a student is in the question selection mode
- **THEN** each photo card displays only the photo image and a minimal selection indicator
- **AND** the photo label text and compliance reason are not visible

#### Scenario: Labels and reasons revealed in feedback
- **WHEN** a student submits an answer (correct or incorrect)
- **THEN** the feedback or success view displays the label and reason for each photo

### Requirement: Image display without clipping
The system SHALL display quiz photos fully visible without clipping any portion of the image.

#### Scenario: Photos render with full visibility
- **WHEN** a quiz photo is displayed in the photo grid
- **THEN** the entire image is visible using `object-contain` inside a consistent aspect-ratio container
- **AND** no portion of the image is cropped or clipped

### Requirement: Image loading and error states
The system SHALL display a loading skeleton while quiz photos are fetching and a branded fallback when an image fails to load.

#### Scenario: Image loading skeleton
- **WHEN** a quiz photo image is being fetched from the server
- **THEN** the system displays a pulsing placeholder skeleton in the photo's position

#### Scenario: Image load failure
- **WHEN** a quiz photo image fails to load (network error, missing URL, or storage unavailable)
- **THEN** the system displays a branded fallback placeholder with the WFD crimson accent color and "Image unavailable" text
- **AND** the quiz remains functional (student can still select based on the label if visible in feedback mode)

### Requirement: Slide transitions between quiz modes
The system SHALL animate transitions between rule, question, and feedback modes using CSS slide animations.

#### Scenario: Slide transition from rule to question
- **WHEN** a student clicks "Next Question" from the rule display
- **THEN** the rule content slides out to the left and the question content slides in from the right

#### Scenario: Slide transition from question to rule
- **WHEN** a student clicks "Review Rule" from the question or feedback display
- **THEN** the question content slides out to the right and the rule content slides in from the left

#### Scenario: Slide transition from question to feedback
- **WHEN** a student submits an incorrect answer
- **THEN** the feedback panel slides up from below the photo grid

### Requirement: Mobile photo card layout
The system SHALL optimize the quiz photo card layout for mobile devices with sticky action buttons.

#### Scenario: Mobile action buttons
- **WHEN** a student views the quiz on a mobile device (viewport width less than 640px)
- **THEN** the submit and navigation buttons are fixed at the bottom of the viewport with a backdrop blur
- **AND** buttons remain accessible without scrolling

