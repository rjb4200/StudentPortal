## Context

The Resource Library step in onboarding renders `resource_categories` with their `resource_documents` as clickable download links. Currently every document is treated as a file (PDF) with a `file_url` and `file_type`. There is no support for embedded content like Google Maps iframes.

Three fire stations exist as a hardcoded ENUM (`station_unit`). The "Station Maps" category has three PDF documents — one per station. Students must download and open separate PDFs to see station locations.

## Goals / Non-Goals

**Goals:**
- Let admins optionally attach a Google Maps embed URL to any resource document
- Render the embed URL as an interactive iframe below the document download link in the onboarding resource library
- Keep existing PDF downloads working exactly as before
- Use standard Google Maps embed iframe format (`allowfullscreen`, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`)

**Non-Goals:**
- Creating a dedicated `stations` table or station management system
- Adding map support anywhere outside the resource library
- Supporting embed types other than Google Maps iframes (YouTube, etc.)
- Changing the onboarding flow or step ordering

## Decisions

### Decision 1: Add `map_embed_url` column to `resource_documents` rather than a separate table

**Chosen**: `ALTER TABLE resource_documents ADD COLUMN map_embed_url text;`

**Alternative considered**: Create a separate `station_maps` table linked to stations. Rejected — there is no stations table, and this change is specifically about enhancing the resource library. A nullable column on the existing table is simpler and avoids schema proliferation.

**Rationale**: Each resource document already represents a station (e.g., "Station 1 - Downtown HQ Map"). Adding a `map_embed_url` to the document keeps the map as an enhancement of that document. A `NULL` column means no map (backward compatible).

### Decision 2: Render map iframe below the document download link

The resource library card for a document currently shows: download icon → document name → file type label. With this change, if `map_embed_url` is set, an additional section renders below with an `<iframe>` containing the Google Maps embed.

**Layout**: The document card expands vertically. The map iframe is constrained to a reasonable height (300px) and fills the card width with `border-radius` matching the card style. On mobile it stays within the single-column grid.

### Decision 3: Admin UI — simple text input for the embed URL

Add a `<textarea>` input labeled "Map Embed URL (optional)" to the document create/edit form in `resource-library-config.tsx`. The admin pastes a Google Maps embed iframe `src` URL (not the full iframe tag — we generate the iframe wrapper).

**Rationale**: Pastors the full iframe tag would require HTML parsing and is error-prone. Having them paste just the URL is simpler and we control the iframe attributes for consistency and security.

## Risks / Trade-offs

- **Map URL validation**: The column accepts any text — admins could paste invalid or malicious URLs. → Mitigation: The iframe uses `sandbox` implicitly via browser cross-origin policy; Google Maps embed URLs follow a predictable `google.com/maps/embed` pattern. No server-side validation needed.
- **iframe performance**: Embedded maps load external resources and can slow page rendering. → Mitigation: Use `loading="lazy"` on the iframe; maps only load when the document card becomes visible. Only one map per document.
- **Existing seed data**: The three station map PDFs are seeded in migration `003`. → No seed data change needed; admins add map URLs through the admin UI at `/admin/setup`.
