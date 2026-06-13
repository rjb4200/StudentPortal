## 1. Database Schema & Seed Data

- [x] 1.1 Create migration for `registration_fields` table (field_key, label, field_type, is_required, placeholder, options, sort_order, is_active, is_permanent) and `student_field_values` table
- [x] 1.2 Create migration for `legal_documents` table (title, body_text, require_checkbox, sort_order, is_active)
- [x] 1.3 Create migration for `resource_categories` table (name, sort_order, is_active) and `resource_documents` table (category_id FK, name, file_url, file_type, sort_order, is_active)
- [x] 1.4 Create migration for `message_templates` table (title, body, template_type, is_active) and `broadcasts` table (title, body, sent_by, sent_at); add `broadcast_id` nullable column to `messages`
- [x] 1.5 Add indexes and RLS policies for all new tables (admin full access, public/authenticated read of active content)
- [x] 1.6 Seed default registration fields matching current form, default legal documents, default resource categories/documents, and a default welcome template
- [x] 1.7 Regenerate Supabase TypeScript types

## 2. Admin Registration Fields UI

- [x] 2.1 Add Registration Fields section to Maintenance & Archive
- [x] 2.2 Build field list showing label, key, type, required state, sort order, and active state
- [x] 2.3 Build create/edit field form with field key, label, type selector (text/email/tel/textarea/select), required toggle, placeholder, options for select type, and sort order
- [x] 2.4 Prevent deactivation or deletion of permanent anchor fields (full_name, email)
- [x] 2.5 Add reorder controls (up/down or drag)

## 3. Admin Legal Documents UI

- [x] 3.1 Add Legal Documents section to Maintenance & Archive
- [x] 3.2 Build document list showing title, checkbox requirement, sort order, and active state
- [x] 3.3 Build create/edit document form with title, body textarea, require_checkbox toggle, sort order, and active toggle

## 4. Admin Resource Library UI

- [x] 4.1 Add Resource Library section to Maintenance & Archive
- [x] 4.2 Build category list with create/edit/delete/reorder controls
- [x] 4.3 Build document list per category with name, file URL, file type, sort order, and active state
- [x] 4.4 Build create/edit document form with name, file URL, file type, file upload input (Supabase Storage), category selector, sort order, and active toggle
- [x] 4.5 Add file upload to Supabase Storage bucket with URL returned to form

## 5. Admin Messaging Configuration UI

- [x] 5.1 Add Message Templates section to the admin messaging area in Daily Ops
- [x] 5.2 Build template list with create/edit/delete controls
- [x] 5.3 Build create/edit template form with title and body textarea
- [x] 5.4 Add template selector dropdown to admin 1:1 message reply input
- [x] 5.5 Add Broadcast button/modal to admin messaging area that sends a message to all certified students
- [x] 5.6 Add template selector to broadcast compose modal
- [x] 5.7 Add Welcome Message configuration (title and body) to the admin messaging or onboarding config area

## 6. Student Registration Form

- [x] 6.1 Fetch active registration fields from Supabase ordered by sort_order
- [x] 6.2 Render full_name and email as permanent first fields, then dynamic fields
- [x] 6.3 Handle different field types (text, email, tel, textarea, select with options)
- [x] 6.4 Store dynamic field values in `student_field_values` on registration submit
- [x] 6.5 Add loading and error states for field configuration fetch
- [x] 6.6 Preserve existing `register_onboarding_student` RPC integration

## 7. Student Legal Waiver

- [x] 7.1 Fetch active legal documents from Supabase ordered by sort_order
- [x] 7.2 Render each document with expandable body text and optional checkbox
- [x] 7.3 Enforce individual checkbox requirements before allowing advancement
- [x] 7.4 Preserve electronic signature requirement
- [x] 7.5 Handle empty-state when no legal documents are active

## 8. Student Resource Library

- [x] 8.1 Fetch active resource categories and documents from Supabase ordered by sort_order
- [x] 8.2 Render categories with grouped document download links
- [x] 8.3 Handle empty-state when no categories or documents are active
- [x] 8.4 Add loading and error states for content fetch

## 9. Student Welcome Message

- [x] 9.1 Fetch active welcome template from Supabase on student dashboard load
- [x] 9.2 Display welcome message on dashboard after onboarding completion
- [x] 9.3 Allow student to dismiss welcome message

## 10. Verification

- [x] 10.1 Verify admin can create/edit/deactivate registration fields and changes appear on onboarding form
- [x] 10.2 Verify admin can create/edit/deactivate legal documents and changes appear on onboarding legal step
- [x] 10.3 Verify admin can create/edit/deactivate resource categories and documents and changes appear on onboarding resource step
- [x] 10.4 Verify admin can create and use message templates in 1:1 replies
- [x] 10.5 Verify admin can send a broadcast message to all certified students
- [x] 10.6 Verify welcome message appears on student dashboard after onboarding
- [x] 10.7 Verify anonymous onboarding users can read active onboarding content but not inactive or admin-only content
- [x] 10.8 Verify non-admin users cannot write to registration fields, legal docs, resources, templates, or broadcasts
- [x] 10.9 Run production build and resolve any TypeScript/build issues
