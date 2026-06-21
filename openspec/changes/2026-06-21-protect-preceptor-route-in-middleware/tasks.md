## Tasks

### 1. Add preceptor route protection to middleware

- [x] Import `canAccessPreceptor` in `src/middleware.ts`
- [x] Add `/preceptor` route block: redirect anonymous → `/login`, 403 for unauthorized
- [x] Add `/preceptor/:path*` to the middleware matcher
- [x] Keep existing client-side check in `preceptor/page.tsx` as UX fallback
