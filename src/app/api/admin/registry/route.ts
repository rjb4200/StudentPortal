import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';
import { adminRegistryUpsertBody } from '@/lib/validation';

function authClientFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  return createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );
}

export async function POST(request: NextRequest) {
  const authClient = authClientFromRequest(request);
  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = adminRegistryUpsertBody.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const adminClient = createAdminClient() as any;
  const { table, id, data } = parsed.data;
  const now = new Date().toISOString();
  let payload: Record<string, any>;

  if (table === 'training_sites') {
    payload = {
      name: data.name,
      organization_name: data.organizationName,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zipCode,
      main_phone: data.mainPhone || null,
      status: data.status ?? 'active',
    };
  } else if (table === 'instructors') {
    payload = {
      training_site_id: data.trainingSiteId || null,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      mobile_phone: data.mobilePhone,
      business_phone: data.businessPhone || null,
      credentials: data.credentials,
      title: data.title,
      preferred_contact_method: data.preferredContactMethod,
      preferred_contact_hours: data.preferredContactHours,
      contact_instructions: data.contactInstructions || null,
      status: data.status ?? 'active',
    };
  } else {
    payload = {
      training_site_id: data.trainingSiteId,
      instructor_id: data.instructorId,
      name: data.name,
      class_start_date: data.classStartDate,
      ride_time_end_date: data.rideTimeEndDate,
      notes: data.notes || null,
      status: data.status ?? 'active',
    };
  }

  if (payload.status === 'active') {
    payload.approved_by = user?.id ?? null;
    payload.approved_at = now;
  }
  payload.updated_at = now;

  const query = id
    ? adminClient.from(table).update(payload).eq('id', id).select().single()
    : adminClient.from(table).insert(payload).select().single();
  const { data: row, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, row });
}
