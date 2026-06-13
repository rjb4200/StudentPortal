## Context

The current onboarding knowledge gate is implemented as hard-coded React data in `src/components/onboarding/knowledge-gate.tsx`. It now follows the desired rule-before-question behavior, but Training staff still cannot change rules, question photos, correct answers, or active content without a code change and Vercel redeploy.

The portal already uses Supabase for data and RLS, and the Admin Command Center is the appropriate place for Training Major/EMS Assistant Chief users to manage operational content. The quiz must still be usable during anonymous onboarding, before a student has a Supabase Auth account.

## Goals / Non-Goals

**Goals:**
- Store onboarding quiz rules and photo answers in Supabase.
- Allow admins to manage rules and photos from the Admin Command Center.
- Render the student quiz from active database configuration.
- Preserve the behavior where a failed question sends the student back to the rule before retrying.
- Allow incomplete onboarding attempts to continue without requiring login.

**Non-Goals:**
- Advanced media storage workflow for uploaded photos in v1. Admins will enter image URLs; Supabase Storage upload can be added later.
- Version locking per student attempt in v1. Students will use the currently active rules when they reach the quiz.
- Question types beyond photo compliance selection.
- Preceptor or student ability to edit quiz configuration.

## Decisions

### 1. Store quiz content in relational Supabase tables

Add `quiz_rules` and `quiz_photos` tables. A rule contains title, rule text, instruction, display order, and active state. Photos belong to a rule and include label, image URL, non-compliant boolean, explanation/reason, display order, and active state.

**Rationale:** The admin UI needs simple CRUD, ordering, and filtering. Relational tables are easier to secure with RLS and query from the onboarding page than storing the entire quiz as one JSON blob.

**Alternative considered:** A single JSON config table. This is faster to build but harder to validate, update partially, and protect against malformed data.

### 2. Admin-only writes, public read of active quiz content

RLS will allow admins with `user_metadata.role = 'admin'` to insert/update/delete quiz rules and photos. Anonymous and authenticated users may read only active quiz rules/photos for onboarding.

**Rationale:** Students must access quiz content before Auth user creation. Active-only read avoids exposing draft/inactive rules.

**Alternative considered:** Serve quiz content through a server route with service role. That would work, but direct Supabase reads are sufficient and simpler if RLS is explicit.

### 3. Add quiz configuration to the Admin Command Center maintenance area

Place the initial management UI under the existing Admin Command Center, likely as a section in Maintenance & Archive or a fourth tab if the UI becomes crowded.

**Rationale:** Quiz content is administrative configuration rather than daily operations. Keeping it in admin avoids introducing a separate route and permission path.

**Alternative considered:** Separate `/admin/quiz` route. This may be cleaner later, but a section in the existing admin page minimizes routing and auth changes.

### 4. Student quiz loads active rules at runtime

The onboarding `KnowledgeGate` component will fetch active rules ordered by `sort_order`, with active photos ordered by `sort_order`. The rule/retry UX remains client-side after content loads.

**Rationale:** Training staff changes become visible without redeploy. The student experience remains responsive after the initial fetch.

**Alternative considered:** Static build-time content generation. That would still require redeploys and fails the admin-configurable requirement.

## Risks / Trade-offs

- **[Risk] Public read policy exposes active quiz content** → Mitigation: only active rule/photo content is public; draft/inactive content remains admin-only. The quiz is educational content, not sensitive authentication material.
- **[Risk] Admins can create a rule with zero correct non-compliant photos** → Mitigation: UI validation requires 4-6 active photos and at least one non-compliant photo before activating a rule.
- **[Risk] Broken image URLs degrade student quiz** → Mitigation: admin UI previews image URLs before save and student UI shows alt/label fallback.
- **[Risk] Ordering edits could create confusing quiz sequence** → Mitigation: store numeric `sort_order` and display explicit order controls.

## Migration Plan

1. Add `quiz_rules` and `quiz_photos` tables with indexes and RLS policies.
2. Seed default quiz rules/photos matching the current hard-coded Hair/Grooming, PPE, and Station Conduct examples.
3. Add admin quiz management UI.
4. Update `KnowledgeGate` to load active rules/photos from Supabase.
5. Verify onboarding can complete using database content.

Rollback: Keep the current hard-coded quiz data available in git history. If the database-backed quiz fails, revert `KnowledgeGate` to hard-coded data and leave the new tables unused until fixed.

## Open Questions

- Should admins upload images to Supabase Storage in v1, or is URL entry acceptable for launch?
- Should completed student attempts store the exact rule/photo IDs and answers for audit review?
