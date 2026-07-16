# class-mou-electronic-signature

## Purpose

Two-party MOU electronic signature workflow for training classes: instructor signs during registration, WFEMS admin signs after review, PDF generated on department letterhead with email delivery.

## Requirements

### Requirement: MOU database record per class
The system SHALL maintain a `class_mous` table with one record per training class containing: training class reference, effective date, training organization name, representative details, representative signature, MOU body snapshot at signing time, and WFEMS signer details with signature timestamp.

#### Scenario: MOU record created for each class
- **WHEN** an instructor completes the MOU signature step during class registration
- **THEN** a class_mous record is created with the instructor's signature and a snapshot of the MOU body text

#### Scenario: WFEMS signature updates existing record
- **WHEN** an admin signs the MOU as WFEMS
- **THEN** the existing class_mous record is updated with the WFEMS signer details and signature timestamp

#### Scenario: Only one MOU exists per class
- **WHEN** a registered class already has an MOU record
- **THEN** the system does not create a second MOU record for that class

### Requirement: MOU body snapshot preserved at signing time
The system SHALL store the complete rendered MOU body text in `mou_body_snapshot` at the time the instructor signs, so later template changes do not affect already-signed agreements.

#### Scenario: MOU body preserved
- **WHEN** the MOU template is updated by an admin after a class MOU was signed
- **THEN** the existing class_mous row retains the original body text from the time of signing

### Requirement: Instructor MOU review and signature step
The instructor registration workflow SHALL include a mandatory fourth step where the instructor reviews a pre-filled MOU containing: effective date, training organization name, class name, class date window, and representative details derived from the registration form. The instructor SHALL type their name as an electronic signature to submit.

#### Scenario: Instructor reviews pre-filled MOU
- **WHEN** an instructor reaches step 4 of the registration workflow
- **THEN** the page displays the full MOU with all fields pre-populated from the TEI, instructor, and class details entered in earlier steps

#### Scenario: Instructor provides electronic signature
- **WHEN** an instructor types their name in the signature field and submits
- **THEN** the instructor_signature and instructor_signed_at fields are recorded on the class_mous record

#### Scenario: Instructor cannot submit without signature
- **WHEN** an instructor attempts to submit the MOU step without providing a signature
- **THEN** the submission is blocked and the missing signature field is highlighted

### Requirement: WFEMS signature tied to admin account
The system SHALL tie the WFEMS signature to a specific admin account. The `class_mous` record SHALL capture a `wfems_signed_by` FK referencing `admin_accounts` at signing time. Signer name and rank SHALL be derived from the admin account row and stored on the MOU record for snapshot purposes. Admin accounts SHALL have a `rank` field.

#### Scenario: Admin signs MOU with their admin identity
- **WHEN** an admin clicks "Sign as WFEMS" on a pending MOU item
- **THEN** the signing admin's account identity (name, rank) is recorded on the MOU record along with the signing timestamp

#### Scenario: Signer identity traceable to admin account
- **WHEN** a completed MOU is viewed or printed
- **THEN** the WFEMS signer name and rank are displayed and traceable to a specific admin account

### Requirement: Admin rank field
The `admin_accounts` table SHALL include a `rank` field that is required for new accounts and editable for existing accounts.

#### Scenario: Admin creates account with rank
- **WHEN** an admin creates a new admin account
- **THEN** the rank field is required before the account can be saved

#### Scenario: Admin edits account rank
- **WHEN** an admin edits an existing admin account
- **THEN** the rank field is editable

### Requirement: MOU notification preference in Account Management
Admin accounts SHALL have a configurable MOU completion notification preference that is editable through the Account Management page.

#### Scenario: Admin enables MOU notifications in Account Management
- **WHEN** an admin edits their account and enables the MOU notification toggle
- **THEN** they receive completed MOU PDF emails when a class MOU is fully signed

#### Scenario: Admin disables MOU notifications
- **WHEN** an admin disables the MOU notification toggle in their account settings
- **THEN** they do not receive completed MOU PDF emails

### Requirement: Auto-filled MOU template
The MOU template body SHALL be rendered with all placeholder values replaced by actual registration data before being presented to the instructor for review and signature. Unsigned party fields SHALL indicate their pending status.

#### Scenario: Instructor sees populated MOU
- **WHEN** an instructor reaches the MOU review step
- **THEN** the MOU displays the training organization name, class name, class date range, effective date (one day after today), and representative details without any raw `{{placeholder}}` tags

#### Scenario: Effective date auto-calculated
- **WHEN** the MOU is presented to the instructor
- **THEN** the effective date field shows one calendar day after the current date

#### Scenario: Unsigned party slot shown as pending
- **WHEN** the instructor reviews the MOU before the WFEMS signer has signed
- **THEN** the WFEMS signer block indicates "[Pending WFEMS signature]" rather than showing a name

### Requirement: Admin Daily Ops MOU signature items
The admin Daily Ops SHALL display MOU records that have instructor signatures but no WFEMS signature, providing context and a sign action without blocking class approval.

#### Scenario: Admin sees instructor-signed MOU awaiting WFEMS signature
- **WHEN** an instructor has signed the MOU but the WFEMS signature is not yet recorded
- **THEN** the MOU item appears in the admin Daily Ops action queue with the class name, TEI, instructor name, instructor signature date, and a "Sign as WFEMS" action

#### Scenario: Admin signs MOU as WFEMS
- **WHEN** an admin clicks "Sign as WFEMS" on a pending MOU item
- **THEN** the WFEMS signer fields are populated from portal settings, the wfems_signed_at timestamp is recorded, and the completed PDF is generated and emailed

#### Scenario: MOU does not block class approval
- **WHEN** an admin has a class pending approval and its MOU is not yet signed by WFEMS
- **THEN** the admin can still approve or reject the class independently

### Requirement: MOU PDF generation on department letterhead
The system SHALL generate a completed MOU PDF on department letterhead after both parties have signed. The PDF SHALL include the letterhead header, MOU title, effective date, party details, class details, the full MOU body text, and signature blocks for both parties.

#### Scenario: PDF generated after WFEMS signature
- **WHEN** the WFEMS signer signs the MOU
- **THEN** the system generates a PDF containing the complete agreement on department letterhead and records the generation timestamp

#### Scenario: PDF includes both signatures
- **WHEN** the completed MOU PDF is generated
- **THEN** the PDF includes the instructor signature details and the WFEMS signer details with dates

### Requirement: Completed MOU PDF emailed to recipients
The system SHALL email the completed MOU PDF as an attachment to the instructor at the email on their instructor record and to admin accounts that have opted in to MOU notifications.

#### Scenario: Instructor receives completed MOU PDF
- **WHEN** the MOU is completed by both parties
- **THEN** the instructor receives a branded email with the completed MOU PDF attached

#### Scenario: Subscribed admins receive completed MOU PDF
- **WHEN** the MOU is completed by both parties
- **THEN** active admin accounts with MOU notification enabled receive a branded email with the completed MOU PDF attached

#### Scenario: Email delivery failure does not invalidate MOU
- **WHEN** MOU PDF email delivery fails for any recipient
- **THEN** the MOU record remains valid and completed, and the failure is logged

### Requirement: Admin printable MOU record
The system SHALL provide an admin-only printable MOU view that renders or regenerates the MOU document from the stored body snapshot and signature data.

#### Scenario: Admin views MOU for a class
- **WHEN** an admin navigates to the printable MOU route for a class
- **THEN** the system renders the complete MOU with all fields, signatures, and the body text from the stored snapshot

#### Scenario: Admin prints MOU
- **WHEN** an admin prints from the printable MOU view
- **THEN** the MOU renders with the department letterhead and both signature blocks in a print-friendly format
