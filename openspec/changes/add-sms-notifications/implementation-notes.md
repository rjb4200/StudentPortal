## Schema Reconciliation

- Live Supabase schema contains `admin_accounts`, `preceptors.email`, admin/preceptor notification columns, and generated TypeScript types for those tables.
- Local migration history does not fully define the live account-management schema, and `supabase` CLI is not installed in this shell, so the SMS migration was created manually as `020_add_sms_notifications.sql` after the existing numbered migrations.
- The SMS DDL was applied live through the Supabase MCP migration tool on project `ejjsahtohaydoogtilgp`.
- Supabase type generation confirmed the live database now includes `notification_queue`, `students.sms_opt_in`, `students.sms_verified`, and admin SMS contact/preference fields.
