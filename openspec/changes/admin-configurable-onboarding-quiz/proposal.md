## Why

The onboarding quiz is currently hard-coded in the application, so changing rules, photos, or correct answers requires a developer change and redeploy. Training staff need to manage quiz content directly from the admin page so onboarding standards can be updated as policies, photos, and compliance examples change.

## What Changes

- Add an admin-managed quiz configuration capability for the student onboarding knowledge gate.
- Store quiz rules, rule text, photo prompts, photo URLs, and correct non-compliance answers in Supabase instead of hard-coded React data.
- Add admin UI for creating, editing, ordering, activating/deactivating, and deleting quiz rules and photos.
- Update the student onboarding quiz to load active rules from Supabase and preserve the current rule-before-question retry behavior.
- Ensure incomplete onboarding records can continue using the current quiz configuration while new attempts use the latest active configuration.

## Capabilities

### New Capabilities
- `admin-configurable-onboarding-quiz`: Admin management of onboarding compliance quiz rules, photos, answers, and active state, plus student quiz rendering from database configuration.

### Modified Capabilities
*(None — no archived baseline specs exist yet.)*

## Impact

- Supabase schema: new tables for quiz rules, quiz photos, and optional quiz attempt/results tracking.
- RLS policies: admins can manage quiz configuration; anonymous/onboarding users can read active quiz content only.
- Admin UI: add quiz configuration section under the Admin Command Center.
- Onboarding UI: replace hard-coded quiz rule/photo data with Supabase-driven content.
- Tests/QA: verify admin edits appear in onboarding, inactive rules are hidden, and failed answers return students to the rule before retrying.
