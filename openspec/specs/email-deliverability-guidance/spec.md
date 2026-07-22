# email-deliverability-guidance Specification

## Purpose
TBD

## Requirements
### Requirement: Contact card download for sender identity
The system SHALL provide a downloadable vCard (`.vcf`) file at `/contact-card.vcf` containing the WFD EMS Portal sender identity with the organization name "Winchester Fire Department - Division of EMS" and the email address `students@winchesterfireems.com`. The file SHALL be served as a static asset with `Content-Type: text/vcard`.

#### Scenario: Student downloads contact card
- **WHEN** a student navigates to `/contact-card.vcf`
- **THEN** the server returns a `.vcf` file with MIME type `text/vcard`
- **AND** the file contains `FN:WFD EMS Portal`, `ORG:Winchester Fire Department - Division of EMS`, and `EMAIL:students@winchesterfireems.com`

### Requirement: Onboarding complete screen shows deliverability guidance
The onboarding complete screen (Step 4) SHALL display a guidance section below the credentials box informing students to check their spam/junk folder and to add the WFD EMS Portal sender to their contacts. The section SHALL include a "Download Contact Card" button linking to `/contact-card.vcf`. The section SHALL be displayed for all students regardless of whether they are new accounts or returning.

#### Scenario: New student sees deliverability guidance on completion screen
- **WHEN** a new student completes onboarding and arrives at Step 4
- **THEN** the screen displays credentials as before
- **AND** a guidance section appears below the credentials with text instructing the student to check their spam folder and add the sender to contacts
- **AND** a "Download Contact Card" button links to `/contact-card.vcf`

#### Scenario: Returning student sees deliverability guidance on completion screen
- **WHEN** a returning student (existing auth user) completes onboarding and arrives at Step 4
- **THEN** the guidance section is still displayed with the same contact card download button

### Requirement: Student dashboard welcome area shows deliverability reminder
The student dashboard SHALL display a dismissible reminder in the welcome area informing the student to add the WFD EMS Portal sender to their contacts. The reminder SHALL include a "Download Contact Card" link to `/contact-card.vcf`. The reminder SHALL be shown to certified students on dashboard load.

#### Scenario: Certified student sees deliverability reminder on dashboard
- **WHEN** a certified student loads the dashboard
- **THEN** the welcome area includes a notice to add `students@winchesterfireems.com` to their contacts
- **AND** a download link for the contact card is present
- **AND** the student can dismiss the notice

#### Scenario: Pending student does not see deliverability reminder
- **WHEN** a pending (not yet approved) student loads the dashboard
- **THEN** the deliverability reminder is not displayed

### Requirement: Email footer includes deliverability guidance
All transactional emails rendered via `buildEmailHtml()` SHALL include a footer line instructing recipients to add `students@winchesterfireems.com` to their contacts. This line SHALL appear between the existing horizontal divider and the "This is an automated message" text. The text SHALL be subtle (small, gray) and not distract from the email body.

#### Scenario: Approval email includes contact guidance in footer
- **WHEN** the student approval email is rendered
- **THEN** the footer contains text instructing the recipient to add `students@winchesterfireems.com` to their contacts
- **AND** the text appears in a small gray font below the main content divider

#### Scenario: Shift reminder email includes contact guidance in footer
- **WHEN** a shift reminder email is rendered
- **THEN** the footer contains the same contact guidance text
- **AND** the text is visually consistent with the approval email footer
