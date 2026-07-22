## Context

The `training_classes` table tracks EMS certification courses but has no structured field for the certification level (EMT, AEMT, Paramedic, etc.). Class names are free-text (e.g., "Summer EMT", "Spring Paramedic Cohort"), and level is inferred by reading the name. This prevents filtering by level, clean display in dropdowns, and structured reporting.

The existing `registration_fields` system supports dynamic `select` fields, but adding level there would disconnect it from the training class entity. Since certification level is an intrinsic property of a class (a class IS an EMT class, or IS a Paramedic class), it belongs on the `training_classes` table itself.

The registration form already loads class options from `GET /api/training-classes/options`, and the admin daily ops roster joins `students` to `training_classes` for display. Adding level as a column lets it flow naturally through existing data paths without new API endpoints or join patterns.

## Goals / Non-Goals

**Goals:**
- Add a constrained `level` column to `training_classes` with seven ordered values: First Responder, EMT, AEMT, Paramedic, Critical Care, Community Paramedic, Wilderness Paramedic
- Show level everywhere a class is displayed: registration dropdown, admin registry table, admin class form, daily ops roster, student detail page
- Append level as a suffix tag in dropdown labels (e.g., "Site A - Summer EMT [EMT]")
- Keep the change additive — no breaking changes to existing data or APIs

**Non-Goals:**
- Filtering classes by level on registration (can be added later if needed)
- Level-based access control or routing
- Level hierarchy enforcement (First Responder doesn't gate EMT, etc.)
- Auto-populating `level` from class names (existing classes default to null)
- Changing the `register_onboarding_student` RPC (class linkage already covers it)

## Decisions

### Decision 1: Level as a column on `training_classes` (not a registration field)

**Rationale**: Level is a property of the class, not a student's independent declaration. Adding it as a `registration_fields` entry would create disconnected data — a student could pick "Paramedic" while registering for an EMT class. Storing level on the class ensures a single source of truth.

**Alternatives considered**:
- `registration_fields` select entry: Zero code, but disconnected from class entity. Rejected.
- Separate `class_levels` lookup table with FK: Over-normalized for a small, stable set of values. Adds complexity without benefit. Rejected.

### Decision 2: Constrained text column with CHECK constraint (not ENUM)

**Rationale**: Postgres ENUMs require `ALTER TYPE` to add values, which is cumbersome during development. A `text` column with a `CHECK` constraint (`level IN (...)` or `level = ANY(ARRAY[...])`) is equally safe for data integrity and easier to extend.

**Constraint**: `CHECK (level IN ('First Responder', 'EMT', 'AEMT', 'Paramedic', 'Critical Care', 'Community Paramedic', 'Wilderness Paramedic'))`

**Display order**: Listed above in the CHECK constraint order, which matches the natural progression of certification levels. Dropdowns will render options in this order.

### Decision 3: Level appended as a suffix tag in class display labels

**Format**: `"Site Name - Class Name [Level]"` — e.g., `"Station 1 - Summer EMT [EMT]"`

**Rationale**: The bracket format visually separates the level from the class name without adding noise. It works in both the registration dropdown and admin roster.

**Composition**: The `getStudentClassLabel()` function in `daily-ops.tsx` and the option-mapping in the training class options API will both append ` [level]` when level is non-null. Existing classes with null level will not show a suffix (graceful degradation).

### Decision 4: No changes to `register_onboarding_student` RPC

**Rationale**: The RPC already accepts `p_training_class_id` and links the student to the class. Since `level` lives on `training_classes`, it's accessible via the existing FK join. No RPC signature change needed. No column needed on `students`.

### Decision 5: Admin class form uses a `<select>` for level (not free text)

**Rationale**: A constrained dropdown prevents typos and ensures data consistency. The seven options render in the order defined by the CHECK constraint. The field is not required (can be null for existing classes without a level), allowing backward compatibility.

## Risks / Trade-offs

- **[Risk] Existing classes have null level** → Mitigation: All display code handles null gracefully (no suffix appended). Admins can edit existing classes to set their level at any time.
- **[Risk] Level values change in the future** → Mitigation: A migration can update the CHECK constraint. All display code reads from the column value, so new levels automatically appear in labels.
- **[Risk] Level not denormalized on `students`** → Mitigation: Accepted trade-off. Level is always one join away through `training_class_id`. If query performance becomes an issue, a generated column or trigger-denormalized column on `students` can be added later without changing the API.

## Migration Plan

1. Apply migration to add `level text` column with CHECK constraint (no default, nullable)
2. Regenerate TypeScript types
3. Deploy code changes (all additive, no breaking changes)
4. Admins update existing classes with appropriate levels through the Registry UI

**Rollback**: Drop the `level` column. All display code handles null gracefully — no display breakage if column is removed. Remove the field from the admin class form.
