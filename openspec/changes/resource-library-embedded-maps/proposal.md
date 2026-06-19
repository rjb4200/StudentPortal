## Why

The onboarding Resource Library currently shows only downloadable PDF maps for each fire station. Students need to see interactive embedded Google Maps for each station so they can explore the station location, surrounding area, and approach routes before their first ride time — without leaving the onboarding flow.

## What Changes

- **Add `map_embed_url` column** to `resource_documents` table (nullable text) via a new migration
- **Render embedded map iframes** in the student-facing resource library component when a document has a `map_embed_url` — the map appears below the document download link
- **Update admin config UI** (`resource-library-config.tsx`) to include a new text input for the map embed URL when creating/editing documents
- **Update database types** to include the new column
- **Seed existing station map documents** with placeholder map embed URLs (empty by default, admins fill in the real URLs)

## Capabilities

### Modified Capabilities
- `admin-configurable-resource-library`: Resource documents now support an optional embedded Google Map rendered via iframe alongside the document download

## Impact

- **Modified files**: `src/components/onboarding/resource-library.tsx`, `src/components/admin/resource-library-config.tsx`, `src/lib/supabase/database.types.ts`
- **New migration**: `supabase/migrations/` — `ALTER TABLE resource_documents ADD COLUMN map_embed_url`
- **Zero breaking changes**: existing documents without a map URL render identically
