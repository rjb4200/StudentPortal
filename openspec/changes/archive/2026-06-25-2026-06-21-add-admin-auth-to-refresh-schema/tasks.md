## Tasks

### 1. Add admin authentication to refresh-schema route

- [x] Add imports: `NextRequest`, `createServerClient`, `canAccessAdmin`, `publicEnv`
- [x] Change `POST()` signature to accept `request: NextRequest`
- [x] Parse cookies and create auth client
- [x] Verify admin access with `canAccessAdmin(user)` — return 403 if not
- [x] Keep existing logic unchanged
