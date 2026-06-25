import { escHtml } from '@/lib/esc-html';
import { buildEmailHtml } from '@/lib/email-html';

export interface EmailContent {
  subject: string;
  html: string;
}

export function buildStudentApprovalEmail(params: {
  full_name: string;
  login_url: string;
}): EmailContent {
  const { full_name, login_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your WFD EMS Student Portal account has been approved. You now have full access to schedule ride time, view preceptors, and submit evaluations.</p>
    <div style="margin:30px 0;text-align:center;">
      <a href="${escHtml(login_url)}" style="display:inline-block;background:#A40104;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;box-shadow:0 4px 12px rgba(164,1,4,0.25);">Go to Student Portal Login</a>
    </div>`;
  return {
    subject: 'WFD EMS Student Portal — Account Approved',
    html: buildEmailHtml('Account Approved', bodyHtml),
  };
}

export function buildOnboardingCompleteStudentEmail(params: {
  email: string;
  temp_password: string | null;
  login_url: string;
}): EmailContent {
  const { email, temp_password, login_url } = params;
  const passwordDisplay = `<div style="margin:20px 0;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px 0;color:#1C1C1E;font-size:14px;font-weight:700;">Your Login Credentials</p>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Username:</strong> ${escHtml(email)}</p>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Password:</strong> ${escHtml(temp_password || 'Use your existing WFD password')}</p>
          <p style="margin:12px 0 0 0;color:#6b7280;font-size:12px;">You will need these to log in once an administrator approves your account.</p>
        </div>`;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Thank you for registering with the WFD EMS Student Portal. Your account has been created and is pending administrative approval.</p>
      ${passwordDisplay}
      <div style="margin:30px 0;text-align:center;">
        <a href="${escHtml(login_url)}" style="display:inline-block;background:#A40104;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;box-shadow:0 4px 12px rgba(164,1,4,0.25);">Go to Student Portal Login</a>
      </div>
      <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">You will be able to log in once an administrator approves your account. You will receive a confirmation email when approved.</p>`;
  return {
    subject: 'WFD EMS Student Portal — Registration Complete',
    html: buildEmailHtml('Student Portal Login', bodyHtml),
  };
}

export function buildOnboardingCompleteAdminEmail(params: {
  full_name: string;
  email: string;
  school_name: string;
  instructor_name?: string | null;
  instructor_contact?: string | null;
  class_name?: string | null;
  class_start_date?: string | null;
  ride_time_end_date?: string | null;
  site_name?: string | null;
  selected_instructor_name?: string | null;
  selected_instructor_contact?: string | null;
}): EmailContent {
  const { full_name, email, school_name } = params;
  const classContext = params.class_name
    ? `<div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Site:</strong> ${escHtml(params.site_name ?? school_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${escHtml(params.class_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Window:</strong> ${escHtml(params.class_start_date ?? 'Unknown')} to ${escHtml(params.ride_time_end_date ?? 'Unknown')}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Instructor:</strong> ${escHtml(params.selected_instructor_name ?? params.instructor_name ?? 'Unknown')}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Instructor Contact:</strong> ${escHtml(params.selected_instructor_contact ?? params.instructor_contact ?? 'Unknown')}</p>
      </div>`
    : `<div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>School/Site:</strong> ${escHtml(school_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Instructor:</strong> ${escHtml(params.instructor_name ?? 'Unknown')}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Instructor Contact:</strong> ${escHtml(params.instructor_contact ?? 'Unknown')}</p>
      </div>`;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">New student completed onboarding: ${escHtml(full_name)} (${escHtml(email)})</p>
      ${classContext}
      <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Review and approve in the admin portal.</p>`;
  return {
    subject: 'New Student Onboarding Complete',
    html: buildEmailHtml('Onboarding Complete', bodyHtml),
  };
}

export function buildShiftCancelledByStudentEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  note: string | null;
  login_url: string;
}): EmailContent {
  const { full_name, date_str, time_display, note, login_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your shift has been <strong>cancelled</strong>.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Status:</strong> Student-initiated</p>
        ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Note:</strong> ${escHtml(note)}</p>` : ''}
      </div>`;
  return {
    subject: 'Shift Cancelled — WFD EMS Student Portal',
    html: buildEmailHtml('Shift Cancelled', bodyHtml, login_url),
  };
}

export function buildShiftCancelledByStudentAdminEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  note: string | null;
}): EmailContent {
  const { full_name, date_str, time_display, note } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">${escHtml(full_name)} has cancelled their shift.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Status:</strong> Student-initiated</p>
        ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Student note:</strong> ${escHtml(note)}</p>` : ''}
      </div>`;
  return {
    subject: 'Student Shift Cancellation — WFD EMS',
    html: buildEmailHtml('Shift Cancelled', bodyHtml),
  };
}

export function buildShiftApprovedEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  login_url: string;
}): EmailContent {
  const { full_name, date_str, time_display, login_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your shift request has been <strong>approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
           </div>`;
  return {
    subject: 'Shift Approved — WFD EMS Student Portal',
    html: buildEmailHtml('Shift Approved', bodyHtml, login_url),
  };
}

export function buildShiftCancelledByAdminEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  note: string | null;
  login_url: string;
}): EmailContent {
  const { full_name, date_str, time_display, note, login_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your shift has been <strong>cancelled</strong> by the EMS Training Division.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
             ${note ? `<p style="margin:10px 0 0 0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Note:</strong> ${escHtml(note)}</p>` : ''}
           </div>
           <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Please contact the Training Division if you have questions.</p>`;
  return {
    subject: 'Shift Cancelled — WFD EMS Student Portal',
    html: buildEmailHtml('Shift Cancelled', bodyHtml, login_url),
  };
}

export function buildShiftRejectedEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  login_url: string;
}): EmailContent {
  const { full_name, date_str, time_display, login_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your shift request was <strong>not approved</strong>.</p>
           <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
             <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
           </div>
           <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Please contact your preceptor or the Training Major for more information.</p>`;
  return {
    subject: 'Shift Request Update — WFD EMS Student Portal',
    html: buildEmailHtml('Shift Update', bodyHtml, login_url),
  };
}

export function buildEvaluationReceiptEmail(params: {
  full_name: string;
}): EmailContent {
  const { full_name } = params;
  return {
    subject: 'Evaluation Receipt — WFD EMS Student Portal',
    html: buildEmailHtml(
      'Evaluation Receipt',
      `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)},</p><p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Your preceptor evaluation has been received. Thank you for your feedback.</p>`
    ),
  };
}

export function buildFlaggedEvaluationEmail(params: {
  student_name: string;
  preceptor_name: string;
  overall_rating: number;
}): EmailContent {
  const { student_name, preceptor_name, overall_rating } = params;
  const msg = `Student ${escHtml(student_name)} submitted a low evaluation (${overall_rating}/5) for preceptor ${escHtml(preceptor_name)}. Review in the admin portal.`;
  return {
    subject: 'WFD EMS: Flagged Evaluation',
    html: buildEmailHtml(
      'Flagged Evaluation',
      `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">${msg}</p>`
    ),
  };
}
