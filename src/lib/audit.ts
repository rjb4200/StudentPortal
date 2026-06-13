import { createAdminClient } from './supabase/admin';

export async function auditLog(action: string, performedBy: string = 'system') {
  try {
    const supabase = createAdminClient();
    await supabase.from('audit_log').insert({
      action,
      performed_by: performedBy,
    });
  } catch {
    console.error('Audit log failed:', action);
  }
}

export async function logKeyEvent(action: string, performedBy: string) {
  await auditLog(action, performedBy);
}
