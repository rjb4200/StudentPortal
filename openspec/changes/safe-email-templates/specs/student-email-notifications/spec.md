## ADDED Requirements

### Requirement: Safe HTML formatting in all transactional emails

All student-provided data inserted into transactional email HTML SHALL be HTML-escaped so that special characters (`<`, `>`, `&`, `"`, `'`) in student names, email addresses, school names, and cancel notes cannot break the email markup or alter the rendered content. This requirement applies to every transactional email defined in this spec: account approval, onboarding completion, schedule approval/rejection/cancellation, evaluation receipt, flagged evaluation, and admin notifications.

#### Scenario: Approval email is safe with special characters in name

- **WHEN** an admin approves a student whose `full_name` is `O'Brien <test@evil.com>`
- **THEN** the approval email HTML contains `O&#39;Brien &lt;test@evil.com&gt;`
- **AND** the email renders correctly in an email client showing the literal name `O'Brien <test@evil.com>`
- **AND** the email subject and CTA button are unaffected

#### Scenario: Onboarding completion email is safe with special characters in email

- **WHEN** a student with email `"user"@school.edu` completes onboarding
- **THEN** the credential email HTML contains `&quot;user&quot;@school.edu`
- **AND** the email displays the correct email address without breaking HTML attribute quoting

#### Scenario: Shift cancellation email is safe with special characters in note

- **WHEN** a student cancels a shift with note `Please cancel — <urgent> & important`
- **THEN** the cancellation email HTML contains `&lt;urgent&gt; &amp; important`
- **AND** the text is rendered as literal text, not HTML tags

#### Scenario: Flagged evaluation email is safe with special characters in names

- **WHEN** a student named `Evil <x>` submits a low evaluation for preceptor `Dr. "Ace" & Son`
- **THEN** the flagged evaluation email HTML contains `Evil &lt;x&gt;` and `Dr. &quot;Ace&quot; &amp; Son`
- **AND** the email renders correctly with the literal names visible

#### Scenario: All existing emails render the same with normal data

- **WHEN** student data contains no special characters (typical names, valid emails, normal school names)
- **THEN** every transactional email renders identically to its pre-fix version
- **AND** no visual differences are detectable in any email client
