## Context

The instructor registration workflow at `/instructor-registration` currently has three steps: TEI, Instructor, and Class. Upon submission, TEI/instructor/class records are created with `pending` status and the instructor receives a confirmation message. This change adds an MOU review and signature step as step 4, then creates a signed MOU database record and sends a completed PDF after both parties sign.

The project already uses `jspdf` in `package.json` for preceptor analytics exports. Resend is the email provider with the existing `sendEmail()` wrapper. `portal_settings` is the admin-configurable settings table. The student profile already has a printable packet pattern.

## Goals / Non-Goals

**Goals:**

- Add a mandatory MOU review and electronic signature step to instructor registration.
- Store one MOU record per training class with a body snapshot and both signatures.
- Generate a completed MOU PDF on department letterhead after both parties sign.
- Email the completed MOU PDF to the instructor and subscribed admins.
- Surface MOU signature items in the admin Daily Ops action queue.
- Make the WFEMS signer identity admin-configurable.
- Retain MOU records for later admin printing.

**Non-Goals:**

- MOU signature does NOT block class approval. MOU items are informational only.
- No change to how TEI, instructor, or class records are approved.
- No student-facing MOU changes.
- No change to the instructor registration layout or branding.
- No automatic MOU renewal or expiration logic.

## Decisions

### Decision: One MOU per class, stored in a new `class_mous` table

Each training class gets exactly one MOU record. The table stores filled values, a snapshot of the agreement body text, both signatures, and timestamps.

```text
class_mous
├── id (uuid, PK)
├── training_class_id (FK to training_classes, unique)
├── effective_date (date)
├── training_organization_name (text)
├── representative_name (text)
├── representative_title (text)
├── representative_signature (text)
├── representative_signed_at (timestamptz)
├── mou_body_snapshot (text)
├── wfems_signer_name (text, from portal_settings at time of wfems signature)
├── wfems_signer_title (text)
├── wfems_signed_at (timestamptz)
├── pdf_generated_at (timestamptz)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

Alternatives: store in `training_classes` directly (muddles class data with agreement data); store only field values without body snapshot (loses the exact agreement text if the template changes later).

### Decision: Store WFEMS signer details in `portal_settings`

Three new portal setting keys:

- `mou_wfems_signer_name` (default: `James Brown`)
- `mou_wfems_signer_title` (default: `EMS Major`)
- `mou_wfems_signer_organization` (default: `Winchester Fire/EMS`)

These are editable by admins through the existing portal settings mechanism or through a dedicated settings section.

Alternatives: hard-code the signer (not configurable without code change); store in a separate table (unnecessary for three key-value pairs).

### Decision: Generate PDF using `jspdf` on the server

`jspdf` is already in the project dependencies and supports text, images, and basic layout. The PDF generation runs in an API route or server-action context on the Node.js runtime.

The PDF will include:

1. Department letterhead header (department name, logo, contact info)
2. MOU title and effective date
3. Party names and class details
4. Full MOU body text
5. Signature blocks for both parties with names, titles, dates

Alternatives: use a third-party PDF service (adds dependency and cost); generate client-side (inconsistent rendering, harder to attach to emails); use `puppeteer`/headless browser (heavy dependency for this use case).

### Decision: Extend `sendEmail()` to support attachments

Resend supports attachments natively. The existing `sendEmail()` function in `src/lib/email.ts` will be extended with an optional `attachments` parameter accepting `{ filename, content, content_type }` objects. The PDF content will be base64-encoded.

```typescript
interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: { filename: string; content: string; content_type: string }[];
}
```

Alternatives: send a download link instead of an attachment (simpler, but not the requirement); create a separate `sendEmailWithAttachment()` function (code duplication).

### Decision: MOU body text stored as a portal setting

The MOU template body text is stored as `mou_template_body` in `portal_settings`. Admins can update it through the maintenance section. At signature time, the template is rendered with the current values and the resulting full text is stored as `mou_body_snapshot` in the `class_mous` row.

Alternatives: store the MOU template in a code file (not admin-editable); store multiple template versions (adds complexity without clear need).

### Decision: PDF generated server-side on demand, not stored

After both parties sign, a PDF is generated by an API route and:
1. Attached to the outgoing emails
2. Available for download through a printable admin route

The PDF is not stored in Supabase Storage in the initial implementation. Admins can re-download or re-print the MOU through `/admin/classes/[id]/mou` which regenerates or serves the PDF from the stored body snapshot and signature data.

Alternatives: store PDFs in Supabase Storage (adds storage management complexity for a document that can be regenerated from database content); generate PDF at MOU creation time (a completed MOU requires both signatures, so generation must happen after the second signature).

### Decision: MOU items in admin Daily Ops are informational

MOU items appear in the "Action Required" card alongside existing item types. They show the class name, TEI, instructor, and whether the instructor has signed or the WFEMS signature is still needed. The admin action is "Sign as WFEMS" when the instructor has already signed.

MOU status does NOT affect the existing class approval workflow. Class approval and MOU signature are independent actions.

## Risks / Trade-offs

- `jspdf` letterhead rendering may differ from the actual department letterhead PDF provided → Mitigation: store the letterhead as an image in Supabase Storage and use it as a background/image in the PDF; admins can replace it.
- Extending `sendEmail()` with attachments changes a shared utility → Mitigation: make attachments optional with backward-compatible defaults.
- MOU template changes could confuse existing signed MOUs → Mitigation: the `mou_body_snapshot` preserves the exact text at signing time.
- Admin action queue may need reordering if MOU items overwhelm it → Mitigation: MOU items go after existing items in the ordered list; pagination or filtering can be added later.

## Open Questions

- Should the letterhead image be stored in Supabase Storage (`branding` bucket already exists) with a known filename, or embedded as a base64 portal setting?
- Should the admin account table get a new `notify_class_mou` column, or should existing `notify_onboarding_complete` be reused for class-related notifications?
- Should the completed MOU PDF be cached/stored in Supabase Storage after first generation, or always regenerated on demand?
