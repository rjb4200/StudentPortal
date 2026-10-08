import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { provisionAccountBody } from '@/lib/validation';
import { authUserRole, findAccountOwnerByAuthUserId, findAuthUserByEmail, type AccountOwner } from '@/lib/auth-provisioning';

function conflict(error: string, code: 'email_exists' | 'role_mismatch', ownerType: AccountOwner | 'auth' | null) {
  return NextResponse.json({ error, code, ownerType }, { status: 409 });
}

function buildProfilePayload(input: ReturnType<typeof provisionAccountBody.parse>) {
  const base = { email: input.email, full_name: input.fullName, is_active: input.isActive, updated_at: new Date().toISOString() };

  if (input.accountType === 'admin') {
    return {
      ...base,
      rank: input.rank,
      notify_onboarding_complete: input.notifyOnboardingComplete,
      notify_evaluation_flagged: input.notifyEvaluationFlagged,
      notify_student_messages: input.notifyStudentMessages,
      notify_daily_report: input.notifyDailyReport,
      notify_schedule_requested: input.notifyScheduleRequested,
      notify_class_mou: input.notifyClassMou,
    };
  }

  return {
    ...base,
    station_unit: input.stationUnit ?? null,
    bio: input.bio || null,
    image_url: input.imageUrl || null,
    specialty_tags: input.specialtyTags ?? null,
    notify_evaluation: input.notifyEvaluation,
    notify_schedule_approved: input.notifyScheduleApproved,
  };
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = provisionAccountBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message, code: 'validation' }, { status: 400 });
  }
  const input = parsed.data;

  const admin = createAdminClient() as any;
  const table: 'admin_accounts' | 'preceptors' = input.accountType === 'admin' ? 'admin_accounts' : 'preceptors';
  const otherTable: 'admin_accounts' | 'preceptors' = input.accountType === 'admin' ? 'preceptors' : 'admin_accounts';
  const otherOwnerLabel: AccountOwner = input.accountType === 'admin' ? 'preceptor' : 'admin';
  const role = input.accountType;
  const email = input.email;

  // Email ownership: the same email may not back two staff accounts.
  const { data: otherRow } = await admin.from(otherTable).select('id').eq('email', email).maybeSingle();
  if (otherRow) {
    return conflict(`This email already belongs to a ${otherOwnerLabel} account. Use a different email.`, 'email_exists', otherOwnerLabel);
  }

  // Reuse an unlinked leftover profile row for the same email, otherwise insert a fresh one.
  const { data: targetRow } = await admin.from(table).select('id, auth_user_id').eq('email', email).maybeSingle();
  if (targetRow?.auth_user_id) {
    return conflict(`A ${input.accountType} account already exists for this email.`, 'email_exists', input.accountType);
  }

  // Create-or-adopt the auth user.
  const existingUser = await findAuthUserByEmail(admin, email);
  let authUserId: string | null = null;
  let createdAuthUser = false;

  if (existingUser) {
    const existingRole = authUserRole(existingUser);
    const linkedOwner = await findAccountOwnerByAuthUserId(admin, existingUser.id);

    if (existingRole !== role) {
      return conflict(
        `This email already has an account with the "${existingRole ?? 'unknown'}" role. Use a different email or change that account's role explicitly.`,
        'role_mismatch',
        linkedOwner ?? 'auth',
      );
    }

    if (linkedOwner && linkedOwner !== role) {
      return conflict(`This email already belongs to a ${linkedOwner} account. Use a different email.`, 'email_exists', linkedOwner);
    }

    authUserId = existingUser.id;
  }

  // Profile row first so a mid-flight failure never reserves the email.
  let profileRowId: string;
  let insertedProfile = false;

  if (targetRow) {
    profileRowId = targetRow.id;
  } else {
    const { data: inserted, error: insertError } = await admin
      .from(table)
      .insert({ ...buildProfilePayload(input), auth_user_id: null })
      .select('id')
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message ?? `Failed to create ${input.accountType} account`, code: 'validation' }, { status: 400 });
    }
    profileRowId = inserted.id;
    insertedProfile = true;
  }

  if (!authUserId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      app_metadata: { role },
    });

    if (createError || !created?.user) {
      if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
      return NextResponse.json({ error: createError?.message ?? 'Failed to create auth user', code: 'link_failed' }, { status: 500 });
    }
    authUserId = created.user.id;
    createdAuthUser = true;
  }

  const { error: linkError } = await admin
    .from(table)
    .update({ auth_user_id: authUserId })
    .eq('id', profileRowId)
    .is('auth_user_id', null)
    .select('id')
    .single();

  if (linkError) {
    // Compensation: only remove the auth user this request created.
    if (createdAuthUser && authUserId) {
      await admin.auth.admin.deleteUser(authUserId).catch(() => {});
    }
    if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
    return NextResponse.json({ error: 'Failed to link account to auth user', code: 'link_failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: authUserId, profileId: profileRowId, adopted: !createdAuthUser });
}
