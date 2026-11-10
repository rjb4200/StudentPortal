# First Due — official API (documented surface)

Base URL for this tenant (also the documented production server):

```
https://sizeup.firstduesizeup.com/fd-api/v1
```

Source: `https://developer.firstdue.com` (OpenAPI "Fire Department REST API" v1.0.0).
Timestamps are documented as ISO 8601 UTC; the tenant's docs state records are
*created* in UTC while date filters are interpreted in the client's timezone.

## Authentication

`POST /auth/token` (no auth required)

```json
{
  "email": "…",
  "password": "…",
  "grant_type": "client_credentials"
}
```

Observed response fields: `access_token`, `expires_in`, `scope`, `token_type`.

## Verified probe (2026-11-10)

`POST /auth/token` returned **200** with:

| Field | Observed |
|---|---|
| `token_type` | `bearer` |
| `scope` | `api web` |
| `expires_in` | `31536000` (365 days) |
| `access_token` | opaque, 32 characters |

Every tested API endpoint then returned **403**:

```json
{"code":0,"message":"You are not authorized to perform this action."}
```

Endpoints tested and refused: `/event-log/activities`, `/schedule`,
`/personnel`, `/personnel/list`, `/shifts`, `/stations`, `/fdids`,
`/apparatuses`, `/locations`, `/logs/settings`.

**Conclusion:** the account authenticates to the API but lacks the API
permission grants. The documented read surface cannot serve as the sync's
verifier today. Grants are per endpoint (the docs reference named permissions
such as `apiUpdateNfirsNotificationAidingAgency` and "FD API - Read
Locations"), so this is a role/permission question for First Due, not a code
problem.

## Documented endpoints considered

| Endpoint | Relevance | Status |
|---|---|---|
| `GET /event-log/activities` | Event Log across modules (`Event`, `Work Shift`, `Daily Log`, …) | 403 |
| `GET /schedule?start=&end=` | Shift board, max 31-day span | 403 |
| `GET /personnel`, `/personnel/list` | Personnel records (not used: students are Events) | 403 |
| `GET /shifts` | Battalion department shifts | 403 |
| `POST /logs` | Application log (`message`, `level_code`), not activities | not tested |

If First Due later grants read permission, `/event-log/activities` can become
the independent verifier described in `design.md`; until then the verifier is a
fresh read over the web surface documented in `shadow-api.md`.
