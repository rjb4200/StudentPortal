## Why

The Training Major sometimes needs a preceptor on the rotation and visible to students without that person logging in. Today the only way to create a preceptor is "Add Preceptor", which always provisions an email/password login — so a roster-only preceptor can't be added without inventing a junk account.

## What Changes

- Make **email and password optional when creating a preceptor**. When both are left blank, create a `preceptors` row with no linked auth user (`auth_user_id` null, `email` null).
- Keep email and password required for admin accounts, and for preceptors who do get a login.
- Reject the mismatched case (email without password, or password without email) with a clear message.
- Editing a login-less preceptor works as a normal profile edit and does not create a login.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `admin-account-management`: creating a preceptor account no longer requires a login; a login-less (roster-only) preceptor may be created.

## Impact

- **Validation** — `provisionAccountBody` preceptor variant: `email` and `password` become optional.
- **API** — `provision-account` route: when neither email nor password is provided for a preceptor, insert the profile row and skip all auth-user handling.
- **Admin UI** — Accounts → Preceptors: email/password labeled optional and no longer required on save.
- **Spec** — `admin-account-management` "Preceptor account management" requirement.
- **Non-goals** — converting an existing login-less preceptor into a login later; a preceptor with no email receives no evaluation/schedule emails.
