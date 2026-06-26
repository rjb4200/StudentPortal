import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { instructorRegistrationBody, uuidSchema } from '@/lib/validation';

function duplicateEmailResponse() {
  return NextResponse.json(
    { success: false, error: 'An instructor with this email already exists for the selected TEI.' },
    { status: 409 }
  );
}

export async function GET(request: NextRequest) {
  const adminClient = createAdminClient() as any;
  const trainingSiteId = request.nextUrl.searchParams.get('trainingSiteId');

  if (trainingSiteId) {
    const parsedSiteId = uuidSchema.safeParse(trainingSiteId);
    if (!parsedSiteId.success) {
      return NextResponse.json({ success: false, error: 'Invalid training site.' }, { status: 400 });
    }
  }

  const [{ data: sites, error: sitesError }, { data: instructors, error: instructorsError }] = await Promise.all([
    adminClient
      .from('training_sites')
      .select('id, name, organization_name, city, state')
      .eq('status', 'active')
      .order('name', { ascending: true }),
    trainingSiteId
      ? adminClient
          .from('instructors')
          .select('id, first_name, last_name, email, credentials, title, training_site_id')
          .eq('status', 'active')
          .eq('training_site_id', trainingSiteId)
          .order('last_name', { ascending: true })
          .order('first_name', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (sitesError || instructorsError) {
    return NextResponse.json(
      { success: false, error: sitesError?.message || instructorsError?.message || 'Unable to load registry options.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, sites: sites ?? [], instructors: instructors ?? [] });
}

export async function POST(request: NextRequest) {
  let createdSiteId: string | null = null;
  let createdInstructorId: string | null = null;

  try {
    const body = await request.json();
    const parsed = instructorRegistrationBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const payload = parsed.data;
    if (payload.site.mode === 'new' && payload.instructor.mode === 'existing') {
      return NextResponse.json({ success: false, error: 'Register a new instructor when registering a new TEI.' }, { status: 400 });
    }

    const adminClient = createAdminClient() as any;
    let trainingSiteId: string;
    let instructorId: string;

    if (payload.site.mode === 'existing') {
      const { data: site, error: siteError } = await adminClient
        .from('training_sites')
        .select('id')
        .eq('id', payload.site.trainingSiteId)
        .eq('status', 'active')
        .single();

      if (siteError || !site) {
        return NextResponse.json({ success: false, error: 'Selected TEI is not available.' }, { status: 400 });
      }
      trainingSiteId = site.id;
    } else {
      const { data: site, error: siteError } = await adminClient
        .from('training_sites')
        .insert({
          name: payload.site.name,
          organization_name: payload.site.organizationName,
          address: payload.site.address,
          city: payload.site.city,
          state: payload.site.state,
          zip_code: payload.site.zipCode,
          main_phone: payload.site.mainPhone || null,
          status: 'pending',
        })
        .select('id')
        .single();

      if (siteError || !site) {
        return NextResponse.json({ success: false, error: siteError?.message || 'Unable to create training site.' }, { status: 500 });
      }
      createdSiteId = site.id;
      trainingSiteId = site.id;
    }

    if (payload.instructor.mode === 'existing') {
      const { data: instructor, error: instructorError } = await adminClient
        .from('instructors')
        .select('id, training_site_id')
        .eq('id', payload.instructor.instructorId)
        .eq('training_site_id', trainingSiteId)
        .eq('status', 'active')
        .single();

      if (instructorError || !instructor) {
        if (createdSiteId) await adminClient.from('training_sites').delete().eq('id', createdSiteId);
        return NextResponse.json({ success: false, error: 'Selected instructor is not available for the selected TEI.' }, { status: 400 });
      }
      instructorId = instructor.id;
    } else {
      const { data: duplicateInstructor, error: duplicateError } = await adminClient
        .from('instructors')
        .select('id')
        .eq('training_site_id', trainingSiteId)
        .eq('email', payload.instructor.email)
        .limit(1)
        .maybeSingle();

      if (duplicateError) {
        if (createdSiteId) await adminClient.from('training_sites').delete().eq('id', createdSiteId);
        return NextResponse.json({ success: false, error: duplicateError.message }, { status: 500 });
      }

      if (duplicateInstructor) {
        if (createdSiteId) await adminClient.from('training_sites').delete().eq('id', createdSiteId);
        return duplicateEmailResponse();
      }

      const { data: instructor, error: instructorError } = await adminClient
        .from('instructors')
        .insert({
          training_site_id: trainingSiteId,
          first_name: payload.instructor.firstName,
          last_name: payload.instructor.lastName,
          email: payload.instructor.email,
          mobile_phone: payload.instructor.mobilePhone,
          business_phone: payload.instructor.businessPhone || null,
          credentials: payload.instructor.credentials,
          title: payload.instructor.title,
          preferred_contact_method: payload.instructor.preferredContactMethod,
          preferred_contact_hours: payload.instructor.preferredContactHours,
          contact_instructions: payload.instructor.contactInstructions || null,
          status: 'pending',
        })
        .select('id')
        .single();

      if (instructorError || !instructor) {
        if (createdSiteId) await adminClient.from('training_sites').delete().eq('id', createdSiteId);
        if (instructorError?.code === '23505') return duplicateEmailResponse();
        return NextResponse.json({ success: false, error: instructorError?.message || 'Unable to create instructor.' }, { status: 500 });
      }
      createdInstructorId = instructor.id;
      instructorId = instructor.id;
    }

    const { data: trainingClass, error: classError } = await adminClient
      .from('training_classes')
      .insert({
        training_site_id: trainingSiteId,
        instructor_id: instructorId,
        name: payload.class.name,
        class_start_date: payload.class.classStartDate,
        ride_time_end_date: payload.class.rideTimeEndDate,
        notes: payload.class.notes || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (classError || !trainingClass) {
      if (createdInstructorId) await adminClient.from('instructors').delete().eq('id', createdInstructorId);
      if (createdSiteId) await adminClient.from('training_sites').delete().eq('id', createdSiteId);
      return NextResponse.json({ success: false, error: classError?.message || 'Unable to create class.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Instructor registration error:', e);
    return NextResponse.json({ success: false, error: 'Unable to submit instructor registration.' }, { status: 500 });
  }
}
