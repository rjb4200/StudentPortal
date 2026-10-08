import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAdmin } from '@/lib/roles';
import { publicEnv } from '@/lib/env';
import { provisionAccountBody } from '@/lib/validation';
import { authUserRole, findAccountOwnerByAuthUserId, findAuthUserByEmail, type AccountOwner } from '@/lib/auth-provisioning';

type ConflictCode = 'email_exists' | 'confirmation_required' | 'cross_family';

function conflict(
  error: string,
  code: ConflictCode,
  ownerType: AccountOwner | 'auth' | null,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error, code, ownerType, ...extra }, { status: 409 });
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
  const role = input.accountType;
  const email = input.email;
  const crossFamilyMessage = 'This email is used by a student account. Student and staff accounts are separate — use a different email.';

  // Student and staff are separate families: a student email cannot back a staff account.
  const { data: studentRow } = await admin.from('students').select('id').eq('email', email).maybeSingle();
  if (studentRow) {
    return conflict(crossFamilyMessage, 'cross_family', 'student');
  }

  // Duplicate: a linked account already exists in the target table.
  const { data: targetRow } = await admin.from(table).select('id, auth_user_id').eq('email', email).maybeSingle();
  if (targetRow?.auth_user_id) {
    return conflict(`A ${input.accountType} account already exists for this email.`, 'email_exists', input.accountType);
  }

  const existingUser = await findAuthUserByEmail(admin, email);
  let authUserId: string | null = null;
  let createdAuthUser = false;
  let deleteExistingUser = false;
  let updateExistingUser = false;

  if (existingUser) {
    const existingRole = authUserRole(existingUser);
    const linkedOwner = await findAccountOwnerByAuthUserId(admin, existingUser.id);

    if (linkedOwner === 'student' || existingRole === 'student') {
      return conflict(crossFamilyMessage, 'cross_family', 'student');
    }

    if (linkedOwner === role) {
      return conflict(`A ${input.accountType} account already exists for this email.`, 'email_exists', input.accountType);
    }

    const roleChange = existingRole !== null && existingRole !== role;
    if (roleChange && !input.confirmRoleChange) {
      return conflict(
        `This email already has a "${existingRole}" login. Creating this account will change its role to "${role}" and replace its password. Confirm to continue.`,
        'confirmation_required',
        linkedOwner ?? 'auth',
        { existingRole, requestedRole: role },
      );
    }

    authUserId = existingUser.id;
    if (linkedOwner) {
      // Linked staff login in the other table: change role in place (never delete a linked login).
      updateExistingUser = true;
    } else {
      // Unlinked orphan: replace (delete + recreate) so role and password apply.
      deleteExistingUser = true;
    }
  }

  // Profile row first so a mid-flight failure never reserves the email.
  let profileRowId: string;
  let insertedProfile = false;

  if (targetRow) {
    profileRowId = targetRow.id;
    await admin.from(table).update(buildProfilePayload(input)).eq('id', profileRowId);
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
  } else if (deleteExistingUser) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(authUserId);
    if (deleteError) {
      if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
      return NextResponse.json({ error: deleteError.message ?? 'Failed to replace existing login', code: 'link_failed' }, { status: 500 });
    }

    const { data: recreated, error: recreateError } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      app_metadata: { role },
    });

    if (recreateError || !recreated?.user) {
      if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
      return NextResponse.json({ error: recreateError?.message ?? 'Failed to recreate login', code: 'link_failed' }, { status: 500 });
    }
    authUserId = recreated.user.id;
    createdAuthUser = true;
  } else if (updateExistingUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, {
      password: input.password,
      app_metadata: { role },
    });
    if (updateError) {
      if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
      return NextResponse.json({ error: updateError.message ?? 'Failed to update existing login', code: 'link_failed' }, { status: 500 });
    }
  }

  const { error: linkError } = await admin
    .from(table)
    .update({ auth_user_id: authUserId })
    .eq('id', profileRowId)
    .is('auth_user_id', null)
    .select('id')
    .single();

  if (linkError) {
    // Compensation: only remove the auth login this request created.
    if (createdAuthUser && authUserId) {
      await admin.auth.admin.deleteUser(authUserId).catch(() => {});
    }
    if (insertedProfile) await admin.from(table).delete().eq('id', profileRowId);
    return NextResponse.json({ error: 'Failed to link account to auth user', code: 'link_failed' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    userId: authUserId,
    profileId: profileRowId,
    replaced: deleteExistingUser,
    roleChanged: updateExistingUser,
  });
}
