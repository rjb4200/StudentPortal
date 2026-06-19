## ADDED Requirements

### Requirement: HTML-safe formatting of student data in email templates

The system SHALL HTML-escape all student-provided and user-provided data before inserting it into transactional email HTML. Data that originates from database fields populated by student input (names, email addresses, school names, cancel notes) MUST be passed through an HTML-escaping function that replaces `&`, `<`, `>`, `"`, and `'` with their HTML entity equivalents. System-generated values (dates, times, URLs constructed from request origin) MAY also be escaped as defense in depth.

#### Scenario: Student name with special characters

- **WHEN** a student's `full_name` contains `<script>`, `&`, or `"`
- **AND** any transactional email is rendered for that student
- **THEN** the email HTML contains `&lt;script&gt;`, `&amp;`, and `&quot;` respectively
- **AND** no raw `<`, `&`, or `"` characters from the student's name appear in the HTML

#### Scenario: School name with apostrophe and ampersand

- **WHEN** a student's `school_name` is `O'Brien & Sons EMS Academy`
- **AND** the onboarding-complete admin notification is rendered
- **THEN** the email HTML contains `O&#39;Brien &amp; Sons EMS Academy`
- **AND** the email markup is not broken by the apostrophe or ampersand

#### Scenario: Cancel note containing HTML-like text

- **WHEN** a student submits a shift cancellation note containing `<b>urgent</b>`
- **AND** the cancellation email is rendered
- **THEN** the email HTML contains `&lt;b&gt;urgent&lt;/b&gt;` as literal text
- **AND** the text is not interpreted as HTML bold tags

#### Scenario: Normal data passes through unchanged

- **WHEN** a student's `full_name` is `John Smith` and `email` is `john@example.com`
- **AND** any transactional email is rendered
- **THEN** the name and email appear verbatim in the email HTML
- **AND** no entity encoding is applied to alphanumeric characters, spaces, or standard punctuation (`.`, `@`)

### Requirement: Centralized email template rendering

The system SHALL define all transactional email templates in a single typed module (`src/lib/email-templates.ts`) that exports one function per email type. Each template function SHALL accept typed parameters, HTML-escape all user-provided values, wrap the body in the shared `buildEmailHtml()` layout, and return both subject and HTML body. No API route SHALL construct email HTML inline.

#### Scenario: Adding a new email type uses a template function

- **WHEN** a developer needs to add a new transactional email
- **THEN** they add a new exported function to `src/lib/email-templates.ts` with typed parameters
- **AND** the function calls `escHtml()` on all user-provided parameter values
- **AND** the function calls `buildEmailHtml()` for the WFD branded wrapper
- **AND** the API route calls the function and passes the result to `sendEmail()`

#### Scenario: Forgetting escaping is prevented by design

- **WHEN** a developer writes a new template function
- **THEN** the only way to insert a parameter value into the HTML is through `escHtml()` — there is no direct access to unescaped interpolation from the route layer
- **AND** all existing template functions serve as copy-paste examples that include escaping
