## 1. Database Migration

- [x] 1.1 Create migration SQL adding `level text` column to `training_classes` with CHECK constraint for the seven values (First Responder, EMT, AEMT, Paramedic, Critical Care, Community Paramedic, Wilderness Paramedic)
- [x] 1.2 Apply migration to Supabase project `ejjsahtohaydoogtilgp` via dashboard SQL editor
- [x] 1.3 Regenerate TypeScript types with `supabase_generate_typescript_types` and update `src/lib/supabase/database.types.ts`

## 2. Class Options API

- [x] 2.1 Update `GET /api/training-classes/options` to include `level` in each option object
- [x] 2.2 Compose display label as `"Site Name - Class Name [Level]"` when level is non-null, omit suffix when null

## 3. Registration Form

- [x] 3.1 Update `registration-form.tsx` class dropdown option labels to include the level suffix from the API response
- [x] 3.2 Update the preselected-class informational banner to display the level when a class is linked via `?class=` URL param

## 4. Admin Registry Management

- [x] 4.1 Add level `<select>` dropdown to the `ClassFields` component in `registry-management.tsx` with the seven options in display order
- [x] 4.2 Include `level` in the upsert payload sent to `POST /api/admin/registry`
- [x] 4.3 Display level as a badge or text column in the `ClassesView` table
- [x] 4.4 Display level in `ClassDetail` enrolled-student view when relevant

## 5. Admin Daily Operations

- [x] 5.1 Add `level` to the `training_classes` select in the pending-approvals and all-students queries in `daily-ops.tsx`
- [x] 5.2 Update `getStudentClassLabel()` to append `[Level]` when the class has a non-null level
- [x] 5.3 Add `level` to the schedules query's `training_classes` select for roster display

## 6. Admin Student Detail Page

- [x] 6.1 Display level in the training class FactGrid or section on `admin/students/[id]/page.tsx` (already fetched via `training_classes(*)` join, just needs rendering)

## 7. Verify

- [x] 7.1 Run `npm run build` to verify TypeScript compilation and build pass
- [x] 7.2 Run `npm run test` to verify no regressions
