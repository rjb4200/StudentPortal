## Why

Training classes lack a structured `level` field (EMT, AEMT, Paramedic, etc.), forcing admins and students to infer certification level from free-text class names. Adding an explicit, constrained level enables the registration dropdown to display the certification tier, gives admins immediate visibility into what level each student is training at, and keeps data clean for future filtering and reporting.

## What Changes

- Add a constrained `level` column to `training_classes` with seven ordered certification levels: First Responder, EMT, AEMT, Paramedic, Critical Care, Community Paramedic, Wilderness Paramedic
- Admin class form (Registry tab) gains a level dropdown when creating or editing a training class
- Admin class list table shows the level for each class
- `/api/training-classes/options` includes `level` in each option, suffixed onto the dropdown label (e.g., "Site A - Summer EMT [EMT]")
- Registration form dropdown appends level badges to each class option
- Daily Operations roster and pending-approval list display the level alongside each student's class
- Student detail profile page shows level in the training class FactGrid
- TypeScript types regenerated to include the new column

## Capabilities

### New Capabilities

- `class-level`: A structured, constrained certification level on training classes that flows through the class options API, registration form dropdown, admin class management, admin student roster, and student detail page

### Modified Capabilities

- `registry-management`: Class create/edit form and class list table gain a level field and column
- `student-onboarding`: Registration form class dropdown appends the level to each option label
- `admin-command-center`: Student roster and pending-approval rows display the student's class level

## Impact

- **Database**: New `level` column on `training_classes` (text with CHECK constraint), migration needed
- **TypeScript types**: `database.types.ts` regenerated
- **API**: `GET /api/training-classes/options` — response shape extended with `level` per option
- **Components**: Registration form, registry management, daily ops, student detail page
- **No breaking changes**: Column defaults to `null`, existing classes unaffected, APIs are additive
