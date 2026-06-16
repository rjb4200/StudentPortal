## Context

The Daily Operations tab currently renders three separate cards for actionable items: Student Approval Queue, Schedule Requests, and Quiz Flags. Each uses the same `<Card>` wrapper with a title, scrollable list, and action buttons. The grid layout (`lg:grid-cols-2`) places Approval Queue and Schedule Requests side-by-side, with Quiz Flags filling the gap underneath.

The only difference between the cards is the action buttons (Approve vs Approve/Reject vs Acknowledge) and the detail line (school/instructor vs date/shift vs rule/attempts).

## Goals / Non-Goals

**Goals:**
- Merge three cards into one unified "Action Required" card
- Add colored type badges so items are distinguishable at a glance
- Sort by priority: Approvals → Schedules → Flags
- Simplify to a single shared empty state
- No behavior changes to individual actions

**Non-Goals:**
- Changing any action logic (approve, reject, acknowledge remain identical)
- Adding filtering or search
- Changing the data fetching or state management
- Affecting any other tab or component

## Decisions

### 1. Single card with typed items

**Decision**: Replace three `<Card>` components with one. Each item gets a type badge (green "Approval", blue "Schedule", amber "Flag") and inline action buttons.

**Rationale**: The three cards share identical structure — header, scrollable list, item rows with name + details + buttons. The only variable is the action buttons per type. Consolidating removes three separate scroll containers in favor of one, and the type badge preserves the visual distinction that the separate cards provided.

### 2. Priority sort order

**Decision**: Approvals first, then Schedule Requests, then Quiz Flags. Each group internally sorted by `created_at` descending.

**Rationale**: Approvals are blocking — the student cannot use the portal until approved. Schedule requests are operational. Quiz flags are informational (the student already passed). This order reflects urgency.

### 3. Type badge design

**Decision**: Small colored pill badges next to each item:
- Approval: `bg-wfd-sage/10 text-wfd-sage` — green
- Schedule: `bg-blue-100 text-blue-700` — blue
- Flag: `bg-amber-100 text-amber-700` — amber

**Rationale**: Sage green for approvals matches the existing "certified" status color. Blue for schedules differentiates from approval. Amber for flags matches the existing quiz flag card styling.

### 4. Layout

**Decision**: The unified card spans full width (`lg:col-span-2`), removing the side-by-side approval/schedule grid. The freed column space allows the Threaded Messaging card to sit alongside it more naturally.

**Rationale**: With three separate cards, the 2-column grid forced a half-and-half layout that left Quiz Flags orphaned below. A full-width unified card with the other cards (Messaging, Roster, Activity) arranged around it makes better use of the space.

## Risks / Trade-offs

- **Longer scroll in the unified card** → Acceptable. The current cards each have `max-h-64 overflow-y-auto`, so they already scroll individually. A single list with the same height cap is equivalent or better.
- **Type badge clutter if many items** → The department has a small student population. If it grows, filtering can be added later.
