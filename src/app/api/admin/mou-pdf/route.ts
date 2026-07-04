import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';

export async function GET(request: NextRequest) {
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
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const mouId = request.nextUrl.searchParams.get('id');
  if (!mouId) {
    return NextResponse.json({ error: 'Missing MOU id' }, { status: 400 });
  }

  const adminClient = createAdminClient() as any;

  const { data: mou, error: mouError } = await adminClient
    .from('class_mous')
    .select('*, training_classes!inner(id, name, class_start_date, ride_time_end_date, training_sites!inner(name, organization_name), instructors!inner(first_name, last_name, email)), admin_accounts!wfems_signed_by(full_name, rank)')
    .eq('id', mouId)
    .single();

  if (mouError || !mou) {
    return NextResponse.json({ error: 'MOU not found' }, { status: 400 });
  }

  if (!mou.wfems_signed_at) {
    return NextResponse.json({ error: 'MOU not yet completed by both parties' }, { status: 400 });
  }

  const trainingClass = Array.isArray(mou.training_classes) ? mou.training_classes[0] : mou.training_classes;
  const site = Array.isArray(trainingClass?.training_sites) ? trainingClass.training_sites[0] : trainingClass?.training_sites;
  const instructor = Array.isArray(trainingClass?.instructors) ? trainingClass.instructors[0] : trainingClass?.instructors;
  const classStart = trainingClass?.class_start_date ?? '';
  const rideEnd = trainingClass?.ride_time_end_date ?? '';
  const siteName = site?.name ?? trainingClass?.name ?? mou.training_organization_name;

  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoUrl = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg';
  let y = 16;

  try {
    const logoRes = await fetch(logoUrl);
    if (logoRes.ok) {
      const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
      const logoBase64 = logoBuffer.toString('base64');
      const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;
      doc.addImage(logoDataUri, 'JPEG', 14, y, 26, 26);
    }
  } catch {}

  const headerLeft = 46;
  doc.setFontSize(18);
  doc.setTextColor(164, 1, 4);
  doc.setFont('helvetica', 'bold');
  doc.text('Winchester Fire/EMS', headerLeft, y + 6);
  doc.setFontSize(9);
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'normal');
  doc.text('44 N Maple Street, Winchester, KY 40392', headerLeft, y + 11.5);
  doc.setFontSize(7);
  doc.setTextColor(106, 153, 78);
  doc.text('DIVISION OF EMS — STUDENT PORTAL', headerLeft, y + 15.5);

  y = 44;
  doc.setDrawColor(164, 1, 4);
  doc.setLineWidth(0.6);
  doc.line(14, y, pageWidth - 14, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMORANDUM OF UNDERSTANDING', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const effectiveDate = mou.effective_date ? new Date(mou.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not specified';
  doc.text(`Effective Date: ${effectiveDate}`, 20, y);
  y += 5;

  doc.text(`Training Organization: ${mou.training_organization_name || 'Not specified'}`, 20, y);
  y += 5;
  doc.text(`Site: ${siteName}`, 20, y);
  y += 5;
  doc.text(`Class: ${trainingClass?.name ?? 'Not specified'} (${classStart} to ${rideEnd})`, 20, y);
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  const bodyLines = doc.splitTextToSize(mou.mou_body_snapshot.replace(/\{\{[^}]+\}\}/g, ''), pageWidth - 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  for (const line of bodyLines) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      y += 4;
      continue;
    }
    if (trimmed.match(/^[0-9]+\.\s/)) {
      doc.setFont('helvetica', 'bold');
      doc.text(trimmed, 20, y);
      doc.setFont('helvetica', 'normal');
      y += 4.5;
    } else {
      doc.text(trimmed, 20, y);
      y += 4.5;
    }
  }

  y += 10;

  doc.setDrawColor(164, 1, 4);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  const repSignedAt = mou.representative_signed_at
    ? new Date(mou.representative_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const wfemsSignedAt = mou.wfems_signed_at
    ? new Date(mou.wfems_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Training Organization Representative:`, 20, y);
  y += 4;
  doc.setFontSize(10);
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${mou.representative_name}, ${mou.representative_title}`, 20, y);
  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed: ${repSignedAt}`, 20, y);

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Winchester Fire/EMS:`, 20, y);
  y += 4;
  doc.setFontSize(10);
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'bold');
  const adminSigner = Array.isArray(mou.admin_accounts) ? mou.admin_accounts[0] : mou.admin_accounts;
  const signerName = adminSigner?.full_name ?? 'Winchester Fire/EMS';
  const signerRank = adminSigner?.rank ?? '';
  doc.text(`${signerName}${signerRank ? `, ${signerRank}` : ''}`, 20, y);
  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed: ${wfemsSignedAt}`, 20, y);

  const pdfOutput = doc.output('arraybuffer');
  const pdfBase64 = Buffer.from(pdfOutput).toString('base64');

  return NextResponse.json({ success: true, pdfBase64, filename: `MOU_${(trainingClass?.name || 'class').replace(/\s+/g, '_')}.pdf` });
}
