# sms-compliance-policy-pages Specification

## Purpose

Public-facing Privacy Policy and Terms & Conditions pages that satisfy SMS compliance requirements (CTIA guidelines, TCPA), describe data collection/usage practices, and provide required consumer disclosures for the WFD EMS Student Portal's SMS notification program.

## Requirements

### Requirement: Privacy Policy page

The system SHALL provide a public Privacy Policy page at `/privacy-policy` accessible without authentication. The page SHALL describe what personal data the portal collects (name, email, phone number, school/program, instructor information, schedule data, onboarding records, messages, and evaluation-related records), how the data is used to operate the EMS Student Portal, and include SMS-specific language stating that phone numbers are used only for operational portal notifications and that SMS opt-in data and phone numbers are not sold or shared with third parties for marketing purposes. The page SHALL include a support contact method.

#### Scenario: Public access to privacy policy

- **WHEN** a user navigates to `/privacy-policy` without being authenticated
- **THEN** the page renders with the branded crimson hero layout and the white content card contains the privacy policy content

#### Scenario: Privacy policy contains SMS data language

- **WHEN** a user reads the privacy policy page
- **THEN** the content states that phone numbers are used only for operational portal notifications (shift approvals, shift reminders, schedule updates, onboarding alerts, and related training notifications) and that SMS opt-in data and phone numbers are not sold or shared with third parties for marketing purposes

#### Scenario: Privacy policy contains support contact

- **WHEN** a user reads the privacy policy page
- **THEN** a support email or contact method is listed

### Requirement: Terms and Conditions page

The system SHALL provide a public Terms and Conditions page at `/terms-and-conditions` accessible without authentication. The page SHALL include an SMS section with: program name ("WFD EMS Student Portal SMS Notifications"), program description (operational EMS Student Portal notifications), message frequency (varies based on portal activity and scheduled shifts), notice that message and data rates may apply, support instructions (reply HELP for help), opt-out instructions (reply STOP to opt out), and a statement that SMS consent is not shared with third parties for marketing purposes.

#### Scenario: Public access to terms and conditions

- **WHEN** a user navigates to `/terms-and-conditions` without being authenticated
- **THEN** the page renders with the branded crimson hero layout and the white content card contains the terms and conditions content

#### Scenario: Terms contains SMS program details

- **WHEN** a user reads the terms and conditions page
- **THEN** the SMS section includes program name, description, frequency disclaimer, message/data rates notice, HELP instructions, STOP instructions, and no-marketing-sharing statement

### Requirement: Footer links to policy pages

The public footer SHALL include links to `/privacy-policy` and `/terms-and-conditions`.

#### Scenario: Footer links visible on public pages

- **WHEN** a user views any page using the public crimson hero layout
- **THEN** the footer displays links to "Privacy Policy" and "Terms & Conditions" alongside the existing copyright text

### Requirement: Policy pages excluded from authenticated header

The `/privacy-policy` and `/terms-and-conditions` routes SHALL be treated as public paths and SHALL NOT show the authenticated header bar.

#### Scenario: No header on policy pages

- **WHEN** a user navigates to `/privacy-policy` or `/terms-and-conditions`
- **THEN** the page renders without the authenticated header bar, consistent with `/`, `/login`, and `/onboarding`
