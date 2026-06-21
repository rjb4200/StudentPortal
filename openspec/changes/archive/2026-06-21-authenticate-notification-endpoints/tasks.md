## Tasks

### 1. Authenticate evaluation-receipt endpoint

- [x] Add cookie extraction and createServerClient with getUser()
- [x] Look up student record by auth_user_id
- [x] Verify request body studentId matches caller's student record
- [x] Return generic 401 for unauthenticated, 403 for mismatched ownership

### 2. Authenticate flagged-evaluation endpoint

- [x] Add cookie extraction and createServerClient with getUser()
- [x] Look up student record by auth_user_id
- [x] Verify request body studentId matches caller's student record
- [x] Return generic 401 for unauthenticated, 403 for mismatched ownership

### 3. Verify

- [x] Run npm run build
- [x] Confirm both endpoints reject unauthenticated requests
