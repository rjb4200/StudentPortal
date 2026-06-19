# formal-esignature-flow Specification

## Purpose
Two-phase legal signature UX pattern — document review (one-at-a-time with scroll enforcement and progress tracking) followed by a dedicated signature block with summary checklist, visual signature line, date display, and legal disclaimer.

## ADDED Requirements

### Requirement: One-at-a-time document review
The system SHALL display legal documents one at a time during onboarding, with Previous and Next navigation buttons and a dot-based progress indicator. The document body SHALL use serif typography (EB Garamond). Each document SHALL display its title in a header bar above the scrollable body text.

#### Scenario: Navigating between documents
- **WHEN** a student clicks "Next" on the first of three documents
- **THEN** the second document is displayed and the progress indicator updates to show position 2 of 3

#### Scenario: Navigating back to previous document
- **WHEN** a student clicks "Previous" on document 2
- **THEN** document 1 is displayed with its previously-set agreement state preserved

#### Scenario: Single document has no navigation
- **WHEN** only one active legal document exists
- **THEN** no Previous/Next buttons or progress dots are displayed

### Requirement: Scroll-to-bottom enforcement
The system SHALL require the student to scroll to the bottom of each document before the "I agree" checkbox becomes enabled. When the entire document is visible without scrolling (document height ≤ container height), the checkbox SHALL be enabled immediately. A visual indicator SHALL hint that more content exists below when the bottom has not been reached.

#### Scenario: Checkbox disabled before scrolling
- **WHEN** a document is displayed and the student has not scrolled to the bottom
- **THEN** the agreement checkbox is disabled

#### Scenario: Checkbox enabled after scrolling
- **WHEN** a student scrolls to the bottom of the document container
- **THEN** the agreement checkbox becomes enabled

#### Scenario: Short document auto-enables
- **WHEN** a document's content fits entirely within the container without scrolling
- **THEN** the agreement checkbox is enabled immediately

### Requirement: Signature phase with summary
After all required documents have been agreed to, the system SHALL display a signature block containing a summary checklist of agreed documents (with ✓ marks), a full legal name input field, a visual signature line displaying the typed name and current date, a legal disclaimer, and a submit button. When only one document exists, the signature block SHALL appear inline below the document without a separate navigation phase.

#### Scenario: Signature block after all documents reviewed
- **WHEN** a student has agreed to all 3 documents and clicks "Sign"
- **THEN** a signature block is displayed showing all 3 agreed documents in a summary checklist
- **AND** the student can type their name and submit

#### Scenario: Single document inline signature
- **WHEN** only one active legal document exists and the student agrees to it
- **THEN** the signature block appears below the document without requiring a separate "Sign" button or phase transition

#### Scenario: Signature block shows current date
- **WHEN** the signature block is displayed
- **THEN** the current date (e.g., "June 17, 2026") is shown alongside the signature line as a visual preview

#### Scenario: Legal disclaimer displayed
- **WHEN** the signature block is displayed
- **THEN** a disclaimer is shown: "By typing your name and clicking the button below, you are electronically signing all documents listed above."
