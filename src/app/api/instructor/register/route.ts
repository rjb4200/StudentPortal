import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { instructorRegistrationBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = instructorRegistrationBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const payload = parsed.data;
    const adminClient = createAdminClient() as any;

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

    const { data: instructor, error: instructorError } = await adminClient
      .from('instructors')
      .insert({
        training_site_id: site.id,
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
      await adminClient.from('training_sites').delete().eq('id', site.id);
      return NextResponse.json({ success: false, error: instructorError?.message || 'Unable to create instructor.' }, { status: 500 });
    }

    const { data: trainingClass, error: classError } = await adminClient
      .from('training_classes')
      .insert({
        training_site_id: site.id,
        instructor_id: instructor.id,
        name: payload.class.name,
        class_start_date: payload.class.classStartDate,
        ride_time_end_date: payload.class.rideTimeEndDate,
        notes: payload.class.notes || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (classError || !trainingClass) {
      await adminClient.from('instructors').delete().eq('id', instructor.id);
      await adminClient.from('training_sites').delete().eq('id', site.id);
      return NextResponse.json({ success: false, error: classError?.message || 'Unable to create class.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Instructor registration error:', e);
    return NextResponse.json({ success: false, error: 'Unable to submit instructor registration.' }, { status: 500 });
  }
}
