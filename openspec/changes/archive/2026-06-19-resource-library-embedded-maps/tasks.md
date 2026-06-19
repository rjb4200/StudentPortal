## 1. Database Migration

- [x] 1.1 Create `supabase/migrations/014_add_resource_document_map_url.sql` — `ALTER TABLE resource_documents ADD COLUMN IF NOT EXISTS map_embed_url text;`
- [ ] 1.2 Apply migration to live Supabase project with `supabase_apply_migration`
- [x] 1.3 Add `map_embed_url` to `src/lib/supabase/database.types.ts` (Row, Insert, Update)

## 2. Admin Configuration UI

- [x] 2.1 Update `src/components/admin/resource-library-config.tsx` — add map_embed_url to form state, edit init, save payload, and Map Embed URL text input

## 3. Student Resource Library

- [x] 3.1 Update `src/components/onboarding/resource-library.tsx` — render embedded map iframe when item.map_embed_url is set

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no TypeScript errors
- [x] 4.2 Manually verify: visit `/admin/setup` → Resource Library config → add a map embed URL to a document; visit `/onboarding` → Resources step → confirm embedded map renders below the document card: visit `/admin/setup` → Resource Library config → add a map embed URL to a document; visit `/onboarding` → Resources step → confirm embedded map renders below the document card
