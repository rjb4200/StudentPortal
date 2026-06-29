# admin-student-legal-documents

## Purpose

Admin view and print of signed legal documents from the student profile, with document access audit logging for security and compliance.

## ADDED Requirements

### Requirement: Signed legal documents table

The student profile SHALL include a Signed Legal Documents section that queries `student_legal_acceptances` joined with `legal_documents` and displays a table with columns: document name/type, status, signed date/time, document version (if available), and actions (view, print).

#### Scenario: Display signed documents

- **WHEN** an admin views the Legal Documents section on a student profile with accepted documents
- **THEN** a table displays each signed document with its name, signed date, and view/print action buttons

#### Scenario: No signed documents

- **WHEN** a student has no `student_legal_acceptances` records
- **THEN** the section displays "No signed legal documents" and contributes to the data completeness warning

#### Scenario: Multiple document types

- **WHEN** the `legal_documents` table contains multiple document types (e.g., HIPAA, Waiver, future additions)
- **THEN** the table displays all accepted documents regardless of type without requiring code changes

### Requirement: View signed legal document

Admins SHALL be able to view the content of a student's signed legal document from the profile. The view SHALL include the document title, full body text, and the student's signature details (legal name, IP address, timestamp).

#### Scenario: View legal document

- **WHEN** an admin clicks "View" on a signed document row
- **THEN** a modal or inline panel displays the full document text with the student's legal signature name, IP address, and the acceptance timestamp

#### Scenario: View action is audited

- **WHEN** an admin views a signed legal document
- **THEN** an audit log entry is recorded with the action "viewed_legal_document", the admin's user ID, the student ID, the document ID, and the current timestamp

### Requirement: Print signed legal document

Admins SHALL be able to print a student's signed legal document. The printed output SHALL include the document title, full body text, the student's legal signature name, the acceptance date, and a timestamp of when the print was generated.

#### Scenario: Print legal document

- **WHEN** an admin clicks "Print" on a signed document row
- **THEN** the browser's print dialog opens with a print-optimized layout showing the document content and signature details

#### Scenario: Print action is audited

- **WHEN** an admin prints a signed legal document
- **THEN** an audit log entry is recorded with the action "printed_legal_document", the admin's user ID, the student ID, the document ID, and the current timestamp

### Requirement: Full student packet export

The profile SHALL include a "Print Full Packet" action that assembles all profile sections into a single printable view. The packet SHALL include: student status summary, instructor info, TEI info, class info, signed legal documents (with signatures), onboarding test status, ride history, and admin notes.

#### Scenario: Print full student packet

- **WHEN** an admin clicks "Print Full Packet"
- **THEN** the browser opens a print-optimized view containing all profile sections in a single scrollable page

#### Scenario: Full packet respects collapsed sections

- **WHEN** an admin prints the full packet
- **THEN** all expandable sections are rendered in their expanded state in the print output regardless of their collapsed/expanded state in the interactive view

### Requirement: Document access audit logging

The system SHALL log document access events to the `audit_log` table when an admin views or prints a signed legal document. Each log entry SHALL include the action type, the performing admin's identifier, and a timestamp.

#### Scenario: Audit log entry for document view

- **WHEN** an admin views a signed legal document
- **THEN** an `audit_log` row is inserted with action "viewed_legal_document", performed_by set to the admin's email or ID, and accurate timestamp

#### Scenario: Audit log entry for document print

- **WHEN** an admin prints a signed legal document or the full packet
- **THEN** an `audit_log` row is inserted with action "printed_legal_document", performed_by set to the admin's email or ID, and accurate timestamp

### Requirement: Role-based document visibility

Signed legal documents and document audit records SHALL only be visible to authorized admin users. Students SHALL NOT see the legal documents section or its audit records.

#### Scenario: Student cannot access legal documents section

- **WHEN** a student (or any non-admin user) attempts to access the legal documents API or section
- **THEN** the system returns a 403 Forbidden response or the section is not rendered
