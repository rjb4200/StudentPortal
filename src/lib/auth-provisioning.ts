export type AccountOwner = 'student' | 'admin' | 'preceptor';

type AuthUserLike = {
  id: string;
  email?: string | null;
  app_metadata?: { role?: unknown } | null;
  raw_app_meta_data?: { role?: unknown } | null;
  last_sign_in_at?: string | null;
};

const AUTH_PAGE_SIZE = 1000;
const AUTH_MAX_PAGES = 20;

export async function listAllAuthUsers(supabase: any): Promise<AuthUserLike[]> {
  const users: AuthUserLike[] = [];
  for (let page = 1; page <= AUTH_MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: AUTH_PAGE_SIZE });
    if (error) throw new Error(error.message);
    const batch: AuthUserLike[] = data?.users ?? [];
    users.push(...batch);
    if (batch.length < AUTH_PAGE_SIZE) break;
  }
  return users;
}

export function authUserRole(user: AuthUserLike | null | undefined): string | null {
  const role = user?.app_metadata?.role ?? user?.raw_app_meta_data?.role;
  return typeof role === 'string' ? role : null;
}

export async function findAuthUserByEmail(supabase: any, email: string): Promise<AuthUserLike | null> {
  const target = email.trim().toLowerCase();
  const users = await listAllAuthUsers(supabase);
  return users.find((user) => (user.email ?? '').toLowerCase() === target) ?? null;
}

export async function findAccountOwnerByAuthUserId(supabase: any, authUserId: string): Promise<AccountOwner | null> {
  const [admin, preceptor, student] = await Promise.all([
    supabase.from('admin_accounts').select('id').eq('auth_user_id', authUserId).maybeSingle(),
    supabase.from('preceptors').select('id').eq('auth_user_id', authUserId).maybeSingle(),
    supabase.from('students').select('id').eq('auth_user_id', authUserId).maybeSingle(),
  ]);

  if (admin?.data) return 'admin';
  if (preceptor?.data) return 'preceptor';
  if (student?.data) return 'student';
  return null;
}

export type OrphanedAuthUser = {
  id: string;
  email: string | null;
  role: string | null;
  lastSignInAt: string | null;
};

export type OrphanReport = {
  total: number;
  neverSignedIn: number;
  orphans: OrphanedAuthUser[];
};

export async function findOrphanedAuthUsers(supabase: any): Promise<OrphanReport> {
  const [users, students, admins, preceptors] = await Promise.all([
    listAllAuthUsers(supabase),
    supabase.from('students').select('auth_user_id, email'),
    supabase.from('admin_accounts').select('auth_user_id, email'),
    supabase.from('preceptors').select('auth_user_id, email'),
  ]);

  const linkedIds = new Set<string>();
  const profileEmails = new Set<string>();
  for (const rows of [students?.data, admins?.data, preceptors?.data]) {
    for (const row of rows ?? []) {
      if (row.auth_user_id) linkedIds.add(row.auth_user_id);
      if (row.email) profileEmails.add(String(row.email).toLowerCase());
    }
  }

  const orphans: OrphanedAuthUser[] = users
    .filter((user) => !linkedIds.has(user.id) && !profileEmails.has((user.email ?? '').toLowerCase()))
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      role: authUserRole(user),
      lastSignInAt: user.last_sign_in_at ?? null,
    }));

  return {
    total: orphans.length,
    neverSignedIn: orphans.filter((orphan) => !orphan.lastSignInAt).length,
    orphans,
  };
}
