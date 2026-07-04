import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';
import { sendEmail } from '@/lib/email';
import { buildMouCompletedInstructorEmail, buildMouCompletedAdminEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () =>
          cookieHeader.split(';').map((c) => {
            const [name, ...rest] = c.trim().split('=');
            return { name, value: rest.join('=') };
          }),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { mouId?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const mouId = body.mouId;
  if (!mouId) {
    return NextResponse.json({ error: 'Missing mouId' }, { status: 400 });
  }

  const adminClient = createAdminClient() as any;

  const { data: admin, error: adminError } = await adminClient
    .from('admin_accounts')
    .select('id, full_name, rank')
    .eq('auth_user_id', user.id)
    .single();

  if (adminError || !admin) {
    return NextResponse.json({ error: 'Admin account not found' }, { status: 403 });
  }

  await adminClient.from('class_mous').update({
    wfems_signed_by: admin.id,
    wfems_signed_at: new Date().toISOString(),
  }).eq('id', mouId);

  const { data: mou, error: mouError } = await adminClient
    .from('class_mous')
    .select('*, training_classes!inner(id, name, class_start_date, ride_time_end_date, training_sites!inner(name, organization_name), instructors!inner(first_name, last_name, email)), admin_accounts!wfems_signed_by(full_name, rank)')
    .eq('id', mouId)
    .single();

  if (mouError || !mou) {
    return NextResponse.json({ error: 'MOU not found after signing' }, { status: 500 });
  }

  const trainingClass = Array.isArray(mou.training_classes) ? mou.training_classes[0] : mou.training_classes;
  const site = Array.isArray(trainingClass?.training_sites) ? trainingClass.training_sites[0] : trainingClass?.training_sites;
  const instructor = Array.isArray(trainingClass?.instructors) ? trainingClass.instructors[0] : trainingClass?.instructors;
  const classStart = trainingClass?.class_start_date ?? '';
  const rideEnd = trainingClass?.ride_time_end_date ?? '';
  const siteName = site?.name ?? mou.training_organization_name;
  const adminSigner = Array.isArray(mou.admin_accounts) ? mou.admin_accounts[0] : mou.admin_accounts;
  const signerName = adminSigner?.full_name ?? 'Winchester Fire/EMS';

  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 25;

  doc.setFontSize(18);
  doc.setTextColor(164, 1, 4);
  doc.setFont('helvetica', 'bold');
  doc.text('Winchester Fire/EMS', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(28, 28, 30);
  doc.text('44 N Maple Street, Winchester, KY 40392', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(106, 153, 78);
  doc.text('Division of EMS — Student Portal', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setDrawColor(164, 1, 4);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMORANDUM OF UNDERSTANDING', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const effDate = mou.effective_date ? new Date(mou.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  doc.text(`Effective Date: ${effDate}`, 20, y); y += 5;
  doc.text(`Training Organization: ${mou.training_organization_name || ''}`, 20, y); y += 5;
  doc.text(`Site: ${siteName}`, 20, y); y += 5;
  doc.text(`Class: ${trainingClass?.name ?? ''} (${classStart} to ${rideEnd})`, 20, y); y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  const bodyLines = doc.splitTextToSize(mou.mou_body_snapshot, pageWidth - 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  for (const line of bodyLines) {
    if (y > 250) { doc.addPage(); y = 20; }
    const trimmed = line.trim();
    if (!trimmed) { y += 4; continue; }
    doc.text(trimmed, 20, y);
    y += 4.5;
  }

  y += 10;
  doc.setDrawColor(164, 1, 4);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  const repDate = mou.representative_signed_at ? new Date(mou.representative_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const wfemsDate = mou.wfems_signed_at ? new Date(mou.wfems_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  doc.setFontSize(8); doc.setTextColor(100, 100, 100);
  doc.text('Training Organization Representative:', 20, y); y += 4;
  doc.setFontSize(10); doc.setTextColor(28, 28, 30); doc.setFont('helvetica', 'bold');
  doc.text(`${mou.representative_name}, ${mou.representative_title}`, 20, y); y += 4;
  doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal');
  doc.text(`Signed: ${repDate}`, 20, y); y += 8;
  doc.setFontSize(8); doc.setTextColor(100, 100, 100);
  doc.text('Winchester Fire/EMS:', 20, y); y += 4;
  doc.setFontSize(10); doc.setTextColor(28, 28, 30); doc.setFont('helvetica', 'bold');
  doc.text(`${signerName}${adminSigner?.rank ? `, ${adminSigner.rank}` : ''}`, 20, y); y += 4;
  doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal');
  doc.text(`Signed: ${wfemsDate}`, 20, y);

  const pdfOutput = doc.output('arraybuffer');
  const pdfBase64 = Buffer.from(pdfOutput).toString('base64');
  const filename = `MOU_${(trainingClass?.name || 'class').replace(/\s+/g, '_')}.pdf`;

  const instructorEmail = instructor?.email;
  const instructorName = instructor ? `${instructor.first_name} ${instructor.last_name}`.trim() : 'Instructor';

  const { data: admins } = await adminClient
    .from('admin_accounts')
    .select('email')
    .eq('is_active', true)
    .eq('notify_class_mou', true);

  const emailErrors: string[] = [];

  if (instructorEmail) {
    const { subject, html } = buildMouCompletedInstructorEmail({
      instructor_name: instructorName,
      class_name: trainingClass?.name ?? '',
      site_name: siteName,
      class_start_date: classStart,
      ride_time_end_date: rideEnd,
    });
    const result = await sendEmail({
      to: instructorEmail,
      subject,
      html,
      attachments: [{ filename, content: pdfBase64, content_type: 'application/pdf' }],
    });
    if (!result.ok) emailErrors.push(`Instructor email failed: ${result.error}`);
  }

  if (admins?.length) {
    const { subject, html } = buildMouCompletedAdminEmail({
      class_name: trainingClass?.name ?? '',
      site_name: siteName,
      class_start_date: classStart,
      ride_time_end_date: rideEnd,
      instructor_name: instructorName,
      wfems_signer_name: signerName,
    });
    const result = await sendEmail({
      to: admins.map((a: any) => a.email),
      subject,
      html,
      attachments: [{ filename, content: pdfBase64, content_type: 'application/pdf' }],
    });
    if (!result.ok) emailErrors.push(`Admin email failed: ${result.error}`);
  }

  return NextResponse.json({
    success: true,
    emailsSent: !instructorEmail ? 0 : 1 + (admins?.length ?? 0),
    errors: emailErrors.length > 0 ? emailErrors : undefined,
  });
}
