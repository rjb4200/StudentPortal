type UserLike = {
  user_metadata?: {
    role?: unknown;
  } | null;
} | null | undefined;

export function getUserRole(userOrRole: UserLike | unknown): string | null {
  if (typeof userOrRole === 'string') return userOrRole;
  if (typeof userOrRole === 'object' && userOrRole && 'user_metadata' in userOrRole) {
    const role = (userOrRole as UserLike)?.user_metadata?.role;
    return typeof role === 'string' ? role : null;
  }
  return null;
}

export function isAdmin(userOrRole: UserLike | unknown) {
  return getUserRole(userOrRole) === 'admin';
}

export function isPreceptor(userOrRole: UserLike | unknown) {
  return getUserRole(userOrRole) === 'preceptor';
}

export function canAccessAdmin(userOrRole: UserLike | unknown) {
  return isAdmin(userOrRole);
}

export function canAccessPreceptor(userOrRole: UserLike | unknown) {
  return isAdmin(userOrRole) || isPreceptor(userOrRole);
}
