## REMOVED Requirements

### Requirement: Magic links redirect to dashboard
**Reason**: Magic link authentication has been fully replaced by password-based auth (password-auth-system change, 2026-06-14). The login page Student tab now accepts email + password. There are no magic links to redirect.
**Migration**: N/A — the redirect behavior for authenticated students is covered by middleware and the `authentication-authorization` spec.

### Requirement: Blacklisted page
**Reason**: This requirement is already defined in `authentication-authorization` spec under "Session timeout on access expiration" (scenarios for blacklisted and archived student redirects). Removing from this spec to eliminate duplication.
**Migration**: No action needed — the `/blacklisted` page and middleware redirect already exist and are documented in `authentication-authorization`.

### Requirement: Expired page
**Reason**: This requirement is already defined in `authentication-authorization` spec under "Session timeout on access expiration" (scenarios for expired student redirects). Removing from this spec to eliminate duplication.
**Migration**: No action needed — the `/expired` page and middleware redirect already exist and are documented in `authentication-authorization`.
