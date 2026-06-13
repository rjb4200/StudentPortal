type EmailTemplate = 'onboarding-notification' | 'schedule-approved' | 'schedule-rejected' | 'evaluation-receipt';

interface EmailData {
  studentName?: string;
  schoolName?: string;
  date?: string;
  shiftType?: string;
  preceptorName?: string;
}

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: EmailData = {}
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping email');
    return;
  }

  const subjects: Record<EmailTemplate, string> = {
    'onboarding-notification': 'Onboarding Complete — WFD EMS Student Portal',
    'schedule-approved': 'Shift Approved — WFD EMS Student Portal',
    'schedule-rejected': 'Shift Request Update — WFD EMS Student Portal',
    'evaluation-receipt': 'Evaluation Receipt — WFD EMS Student Portal',
  };

  const bodies: Record<EmailTemplate, string> = {
    'onboarding-notification': `
      <p>Hi ${data.studentName || 'Student'},</p>
      <p>Your onboarding submission is complete. An administrator will review your application and grant you access to the portal.</p>
      <p>— WFD Division of EMS</p>
    `,
    'schedule-approved': `
      <p>Your shift request for <strong>${data.date}</strong> (${data.shiftType}) has been <strong>approved</strong>.</p>
      <p>— WFD Division of EMS</p>
    `,
    'schedule-rejected': `
      <p>Your shift request for <strong>${data.date}</strong> (${data.shiftType}) was not approved. Please contact your preceptor or the Training Major for more information.</p>
      <p>— WFD Division of EMS</p>
    `,
    'evaluation-receipt': `
      <p>Hi ${data.studentName || 'Student'},</p>
      <p>Your evaluation for ${data.preceptorName || 'your preceptor'} has been received. Thank you for your feedback.</p>
      <p>— WFD Division of EMS</p>
    `,
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WFD EMS Portal <noreply@winchesterfireems.com>',
      to,
      subject: subjects[template],
      html: bodies[template],
    }),
  });
}
