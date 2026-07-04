import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';
import { sendEmail } from '@/lib/email';
import { buildEmailHtml, EMAIL_CRIMSON, EMAIL_CHARCOAL } from '@/lib/email-html';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieHeader.split(';').map((c) => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!canAccessAdmin(user) || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminClient = createAdminClient() as any;
  const mouId = request.nextUrl.searchParams.get('id');

  const query = mouId
    ? adminClient.from('class_mous').select('*, training_classes!inner(id, name, class_start_date, ride_time_end_date, training_sites!inner(name, organization_name), instructors!inner(first_name, last_name, email)), admin_accounts!wfems_signed_by(full_name, rank)').eq('id', mouId).single()
    : adminClient.from('class_mous').select('*, training_classes!inner(id, name, class_start_date, ride_time_end_date, training_sites!inner(name, organization_name), instructors!inner(first_name, last_name, email)), admin_accounts!wfems_signed_by(full_name, rank)').not('wfems_signed_at', 'is', null).order('created_at', { ascending: false }).limit(1).single();

  const { data: mou, error: mouError } = await query;

  if (mouError || !mou) {
    return NextResponse.json({ error: 'No completed MOU found' }, { status: 404 });
  }

  const trainingClass = Array.isArray(mou.training_classes) ? mou.training_classes[0] : mou.training_classes;
  const site = Array.isArray(trainingClass?.training_sites) ? trainingClass.training_sites[0] : trainingClass?.training_sites;
  const instructor = Array.isArray(trainingClass?.instructors) ? trainingClass.instructors[0] : trainingClass?.instructors;
  const adminSigner = Array.isArray(mou.admin_accounts) ? mou.admin_accounts[0] : mou.admin_accounts;
  const signerName = adminSigner?.full_name ?? 'Winchester Fire/EMS';

  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const letterheadUrl = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/mou-letterhead.png';
  const logoUrl = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg';
  let y = 50;
  let hasLetterhead = false;

  try {
    const lhRes = await fetch(letterheadUrl);
    if (lhRes.ok) {
      const lhBuffer = Buffer.from(await lhRes.arrayBuffer());
      doc.addImage(`data:image/png;base64,${lhBuffer.toString('base64')}`, 'PNG', 0, 0, pageWidth, pageHeight);
      hasLetterhead = true;
      y = 50;
    }
  } catch {}

  if (!hasLetterhead) {
    y = 16;
    try {
      const logoRes = await fetch(logoUrl);
      if (logoRes.ok) {
        const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
        doc.addImage(`data:image/jpeg;base64,${logoBuffer.toString('base64')}`, 'JPEG', 14, y, 26, 26);
      }
    } catch {}
    const hl = 46;
    doc.setFontSize(18); doc.setTextColor(164, 1, 4); doc.setFont('helvetica', 'bold');
    doc.text('Winchester Fire/EMS', hl, y + 6);
    doc.setFontSize(9); doc.setTextColor(28, 28, 30); doc.setFont('helvetica', 'normal');
    doc.text('44 N Maple Street, Winchester, KY 40392', hl, y + 11.5);
    doc.setFontSize(7); doc.setTextColor(106, 153, 78);
    doc.text('DIVISION OF EMS — STUDENT PORTAL', hl, y + 15.5);
    y = 44;
  }

  doc.setDrawColor(164, 1, 4); doc.setLineWidth(0.6);
  doc.line(14, y, pageWidth - 14, y);
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3);
  doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
  y += 8;

  doc.setFontSize(14); doc.setTextColor(28, 28, 30); doc.setFont('helvetica', 'bold');
  doc.text('MEMORANDUM OF UNDERSTANDING', pageWidth / 2, y, { align: 'center' }); y += 8;

  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Effective Date: ${mou.effective_date ? new Date(mou.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}`, 20, y); y += 5;
  doc.text(`Training Organization: ${mou.training_organization_name || ''}`, 20, y); y += 5;
  doc.text(`Site: ${site?.name ?? mou.training_organization_name}`, 20, y); y += 5;
  doc.text(`Class: ${trainingClass?.name ?? ''} (${trainingClass?.class_start_date ?? ''} to ${trainingClass?.ride_time_end_date ?? ''})`, 20, y); y += 8;
  doc.setDrawColor(200, 200, 200); doc.line(20, y, pageWidth - 20, y); y += 6;

  const bodyLines = doc.splitTextToSize(mou.mou_body_snapshot, pageWidth - 40);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
  for (const line of bodyLines) {
    if (y > 250) { doc.addPage(); y = 20; }
    if (!line.trim()) { y += 4; continue; }
    doc.text(line.trim(), 20, y); y += 4.5;
  }

  y += 10;
  doc.setDrawColor(164, 1, 4); doc.line(20, y, pageWidth - 20, y); y += 8;
  const repDate = mou.representative_signed_at ? new Date(mou.representative_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const wfDate = mou.wfems_signed_at ? new Date(mou.wfems_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

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
  doc.text(`Signed: ${wfDate}`, 20, y);

  const pdfOutput = doc.output('arraybuffer');
  const pdfBase64 = Buffer.from(pdfOutput).toString('base64');
  const filename = `MOU_${(trainingClass?.name || 'class').replace(/\s+/g, '_')}.pdf`;

  const { data: adminAccount } = await adminClient.from('admin_accounts').select('email').eq('auth_user_id', user.id).single();
  const testEmail = adminAccount?.email || user.email || 'rjb4200@gmail.com';

  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">This is a test of the MOU PDF with department letterhead.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        ${site?.name ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Site:</strong> ${site.name}</p>` : ''}
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${trainingClass?.name ?? ''}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>WFEMS Signed By:</strong> ${signerName}</p>
      </div>`;

  const result = await sendEmail({
    to: testEmail,
    subject: `TEST — MOU PDF: ${trainingClass?.name ?? 'Class'}`,
    html: buildEmailHtml('MOU PDF Test', bodyHtml),
    attachments: [{ filename, content: pdfBase64, content_type: 'application/pdf' }],
  });

  return NextResponse.json({
    success: result.ok,
    error: result.error,
    sentTo: testEmail,
    mouId: mou.id,
    className: trainingClass?.name,
    pdfFilename: filename,
  });
}
