import { createAdminClient } from './supabase/admin';

export async function approveStudent(studentId: string, email: string) {
  const supabase = createAdminClient();

  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { role: 'student' },
  });

  if (createError) {
    if (createError.message.includes('already been registered')) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find((u) => u.email === email);
      if (!found) throw createError;

      const { data: student } = await supabase
        .from('students')
        .update({
          status: 'certified',
          access_until: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          auth_user_id: found.id,
        })
        .eq('id', studentId)
        .select()
        .single();

      return student;
    }
    throw createError;
  }

  const { data: student } = await supabase
    .from('students')
    .update({
      auth_user_id: authUser.user.id,
      status: 'certified',
      access_until: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', studentId)
    .select()
    .single();

  return student;
}

export async function getPendingStudents() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return data ?? [];
}
