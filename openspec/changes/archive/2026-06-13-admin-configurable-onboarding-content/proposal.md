## Why

Three parts of the student onboarding experience are hard-coded in the application: registration form fields, legal agreement text, and the downloadable resource library. Additionally, admin messaging to students is limited to 1:1 replies with no broadcast, template, or welcome-message capability. Training staff need to manage all of these from the admin page so onboarding content, messaging, and resources can evolve without developer redeploys.

## What Changes

- Store registration form field configuration in Supabase so admins can add, remove, reorder, rename, and toggle required fields.
- Store legal agreement documents in Supabase so admins can edit HIPAA, liability, and additional legal text.
- Store resource library categories and downloadable documents in Supabase so admins can add, remove, reorder, and upload or link resources.
- Add admin message broadcasts, reusable message templates, and a configurable onboarding welcome message.
- Update the student-facing registration form, legal waiver, resource library, and messaging components to render from database configuration.
- Keep the onboarding step sequence fixed (Register → Legal → Resources → Quiz).

## Capabilities

### New Capabilities
- `admin-configurable-registration-fields`: Admin management of the student registration form fields, including adding, removing, reordering, renaming, toggling required/optional, and setting field types.
- `admin-configurable-legal-documents`: Admin management of legal agreement documents displayed during onboarding, including editing text, toggling checkbox requirements, activation, and sort order.
- `admin-configurable-resource-library`: Admin management of the onboarding resource library categories and downloadable documents, including file upload or URL entry, labels, ordering, and activation.
- `admin-configurable-messaging`: Admin message broadcasts to all students, reusable message templates, and a configurable onboarding welcome message shown post-registration or post-quiz.

### Modified Capabilities
*(None — no archived baseline specs exist yet.)*

## Impact

- Supabase schema: new tables for `registration_fields`, `legal_documents`, `resource_categories`, `resource_documents`, `message_templates`, and a `broadcast` flag or table for messages.
- RLS policies: admins manage all onboarding content; anonymous and authenticated students read active content only (except broadcasts which require auth).
- Admin UI: add Registration Fields, Legal Documents, Resource Library, and Message Templates sections to Maintenance & Archive or a new tab.
- Onboarding UI: replace hard-coded registration fields, legal text, and resource lists with Supabase-driven content and add welcome message display.
- Messages UI: add broadcast and template capabilities to the existing admin messaging section.
- Supabase Storage: optional bucket for resource document uploads (v1 may use URL entry).
