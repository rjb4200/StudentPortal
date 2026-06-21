## Tasks

### 1. Add CRON_SECRET auth check to cron sweep route

- [x] Import `NextRequest` and change `GET()` signature
- [x] Read `Authorization` header and compare with `process.env.CRON_SECRET`
- [x] Return `401` if secret missing or invalid before initializing admin client
- [x] Keep existing sweep logic unchanged
