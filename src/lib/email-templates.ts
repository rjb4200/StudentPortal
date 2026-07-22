import { escHtml } from '@/lib/esc-html';
import { buildEmailHtml } from '@/lib/email-html';

export interface EmailContent {
  subject: string;
  html: string;
}

export function buildStudentApprovalEmail(params: {
  full_name: string;
  login_url: string;
  station_map_url?: string | null;
}): EmailContent {
  const { full_name, login_url, station_map_url } = params;
  const stationMapLink = station_map_url
    ? `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;"><a href="${escHtml(station_map_url)}" style="color:#A40104;font-weight:700;">View the Station 1 map</a></p>`
    : '';
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your WFD EMS Student Portal account has been approved. You now have full access to schedule ride time, view preceptors, and submit evaluations.</p>
    <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">For each ride, report to Station 1 at 0700 for assignment by the on-duty Brigade Chief.</p>
    ${stationMapLink}
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

export function buildInstructorClassApprovedEmail(params: {
  instructor_name: string;
  class_name: string;
  class_start_date: string;
  ride_time_end_date: string;
  site_name?: string | null;
  registration_url?: string | null;
}): EmailContent {
  const registrationLink = params.registration_url
    ? `<div style="margin:28px 0;text-align:center;">
        <a href="${escHtml(params.registration_url)}" style="display:inline-block;background:#A40104;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;box-shadow:0 4px 12px rgba(164,1,4,0.25);">Student Registration Link</a>
      </div>
      <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Share this link with students for this class. Students who use it will have this class preselected during registration.</p>`
    : '';
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(params.instructor_name)}, your class has been <strong>approved</strong> in the WFD EMS Student Portal.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        ${params.site_name ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Training Site:</strong> ${escHtml(params.site_name)}</p>` : ''}
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${escHtml(params.class_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class Start:</strong> ${escHtml(params.class_start_date)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Ride-Time End:</strong> ${escHtml(params.ride_time_end_date)}</p>
      </div>
      ${registrationLink}
      <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">Students can register once the class start date has been reached and may schedule ride time through the approved ride-time end date.</p>`;
  return {
    subject: 'Class Approved — WFD EMS Student Portal',
    html: buildEmailHtml('Class Approved', bodyHtml),
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

export function buildShiftRequestedAdminEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  shift_type: string;
}): EmailContent {
  const { full_name, date_str, time_display, shift_type } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">${escHtml(full_name)} has submitted a new shift request.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(date_str)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(time_display)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Shift Type:</strong> ${escHtml(shift_type)}</p>
      </div>`;
  return {
    subject: 'New Shift Request — WFD EMS',
    html: buildEmailHtml('Shift Request Submitted', bodyHtml),
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

export function buildShiftReminderEmail(params: {
  full_name: string;
  date_str: string;
  time_display: string;
  shift_label: string;
  chief_name: string;
  dashboard_url: string;
  station_map_url?: string | null;
}): EmailContent {
  const stationMapLink = params.station_map_url
    ? `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;"><a href="${escHtml(params.station_map_url)}" style="color:#A40104;font-weight:700;">View the Station 1 map</a></p>`
    : '';
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(params.full_name)}, this is a reminder for your clinical ride tomorrow.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:400px;">
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Date:</strong> ${escHtml(params.date_str)}</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Time:</strong> ${escHtml(params.time_display)}</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Duty Shift:</strong> ${escHtml(params.shift_label)}</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>On-Duty Brigade Chief:</strong> ${escHtml(params.chief_name)}</p>
    </div>
    <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Report to Station 1 at 0700 for assignment by the on-duty Brigade Chief.</p>
    ${stationMapLink}`;
  return {
    subject: 'Shift Reminder — WFD EMS Student Portal',
    html: buildEmailHtml('Ride Reminder', bodyHtml, params.dashboard_url),
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

export function buildAdminReplyStudentEmail(params: {
  student_name: string;
  message_text: string;
  dashboard_url: string;
}): EmailContent {
  const excerpt = params.message_text.length > 500 ? `${params.message_text.slice(0, 497)}...` : params.message_text;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">The WFD EMS Training Division has replied to your message.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:480px;">
      <p style="margin:0;color:#1c1c1e;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escHtml(excerpt)}</p>
    </div>`;
  return {
    subject: 'New reply from WFD EMS staff',
    html: buildEmailHtml('Staff Reply', bodyHtml, params.dashboard_url, 'View Messages'),
  };
}

export function buildStudentMessageAdminEmail(params: {
  student_name: string;
  student_email: string;
  message_text: string;
  conversation_url: string;
}): EmailContent {
  const excerpt = params.message_text.length > 500 ? `${params.message_text.slice(0, 497)}...` : params.message_text;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;"><strong>${escHtml(params.student_name)}</strong> sent a message from the EMS Student Portal.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:480px;">
      <p style="margin:0 0 8px 0;color:#4b5563;font-size:14px;"><strong>Student:</strong> ${escHtml(params.student_name)}</p>
      <p style="margin:0 0 12px 0;color:#4b5563;font-size:14px;"><strong>Email:</strong> ${escHtml(params.student_email)}</p>
      <p style="margin:0;color:#1c1c1e;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escHtml(excerpt)}</p>
    </div>`;
  return {
    subject: `New student message from ${params.student_name}`,
    html: buildEmailHtml('Student Message', bodyHtml, params.conversation_url, 'Open Conversation'),
  };
}

export function buildMouCompletedInstructorEmail(params: {
  instructor_name: string;
  class_name: string;
  site_name: string | null;
  class_start_date: string;
  ride_time_end_date: string;
}): EmailContent {
  const { instructor_name, class_name, site_name, class_start_date, ride_time_end_date } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(instructor_name)}, the Memorandum of Understanding for your class has been completed and signed by both parties.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        ${site_name ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Training Site:</strong> ${escHtml(site_name)}</p>` : ''}
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${escHtml(class_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class Window:</strong> ${escHtml(class_start_date)} to ${escHtml(ride_time_end_date)}</p>
      </div>
      <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">The completed MOU PDF is attached to this email. Please keep it for your records.</p>`;
  return {
    subject: 'MOU Completed — WFD EMS Student Portal',
    html: buildEmailHtml('MOU Completed', bodyHtml),
  };
}

export function buildMouCompletedAdminEmail(params: {
  class_name: string;
  site_name: string | null;
  class_start_date: string;
  ride_time_end_date: string;
  instructor_name: string;
  wfems_signer_name: string;
}): EmailContent {
  const { class_name, site_name, class_start_date, ride_time_end_date, instructor_name, wfems_signer_name } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">A class MOU has been completed and signed by both parties.</p>
      <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
        ${site_name ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Training Site:</strong> ${escHtml(site_name)}</p>` : ''}
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${escHtml(class_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class Window:</strong> ${escHtml(class_start_date)} to ${escHtml(ride_time_end_date)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Instructor:</strong> ${escHtml(instructor_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>WFEMS Signed By:</strong> ${escHtml(wfems_signer_name)}</p>
      </div>
      <p style="margin:0 auto 20px auto;max-width:500px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">The completed MOU PDF is attached. View the class in the admin portal for the full record.</p>`;
  return {
    subject: 'Class MOU Completed — WFD EMS',
    html: buildEmailHtml('MOU Completed', bodyHtml),
  };
}

export function buildStudentRejectionEmail(params: {
  full_name: string;
  reason: string;
  site_url: string;
}): EmailContent {
  const { full_name, reason, site_url } = params;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(full_name)}, your application to the WFD EMS Student Portal has been <strong>declined</strong>.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Reason:</strong> ${escHtml(reason)}</p>
    </div>
    <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">You may reapply if your circumstances change. Contact your instructor or training site coordinator for more information.</p>
    <div style="margin:30px 0;text-align:center;">
      <a href="${escHtml(site_url)}" style="display:inline-block;background:#A40104;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:10px;box-shadow:0 4px 12px rgba(164,1,4,0.25);">Reapply</a>
    </div>`;
  return {
    subject: 'WFD EMS Student Portal — Application Declined',
    html: buildEmailHtml('Application Declined', bodyHtml),
  };
}

export function buildInstructorRejectionEmail(params: {
  instructor_name: string;
  student_name: string;
  class_name?: string | null;
  reason: string;
}): EmailContent {
  const { instructor_name, student_name, class_name, reason } = params;
  const classLine = class_name
    ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Class:</strong> ${escHtml(class_name)}</p>`
    : '';
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">Hi ${escHtml(instructor_name)}, a student application has been <strong>declined</strong>.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Student:</strong> ${escHtml(student_name)}</p>
      ${classLine}
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Reason:</strong> ${escHtml(reason)}</p>
    </div>
    <p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:14px;line-height:1.6;text-align:center;">The student may reapply if circumstances change.</p>`;
  return {
    subject: 'Student Application Declined — WFD EMS Student Portal',
    html: buildEmailHtml('Student Application Declined', bodyHtml),
  };
}

export function buildAdminRejectionNotification(params: {
  student_name: string;
  student_email: string;
  student_phone?: string | null;
  school_name: string;
  class_name?: string | null;
  class_start_date?: string | null;
  ride_time_end_date?: string | null;
  site_name?: string | null;
  instructor_name?: string | null;
  instructor_contact?: string | null;
  reason: string;
  rejected_by: string;
}): EmailContent {
  const { student_name, student_email, student_phone, school_name, class_name, class_start_date, ride_time_end_date, site_name, instructor_name, instructor_contact, reason, rejected_by } = params;
  const classBlock = class_name
    ? `<div style="margin:16px 0;padding:12px 14px;background:#fff;border-radius:6px;border:1px solid #e5e7eb;">
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Class:</strong> ${escHtml(class_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Site:</strong> ${escHtml(site_name ?? school_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Window:</strong> ${escHtml(class_start_date ?? 'N/A')} to ${escHtml(ride_time_end_date ?? 'N/A')}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Instructor:</strong> ${escHtml(instructor_name ?? 'N/A')}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Instructor Contact:</strong> ${escHtml(instructor_contact ?? 'N/A')}</p>
      </div>`
    : `<div style="margin:16px 0;padding:12px 14px;background:#fff;border-radius:6px;border:1px solid #e5e7eb;">
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>School/Site:</strong> ${escHtml(school_name)}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Instructor:</strong> ${escHtml(instructor_name ?? 'N/A')}</p>
        <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.8;"><strong>Instructor Contact:</strong> ${escHtml(instructor_contact ?? 'N/A')}</p>
      </div>`;
  const bodyHtml = `<p style="margin:0 auto 20px auto;max-width:480px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">A student application has been <strong>rejected</strong>.</p>
    <div style="margin:20px auto;padding:16px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;max-width:440px;">
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Student:</strong> ${escHtml(student_name)}</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Email:</strong> ${escHtml(student_email)}</p>
      ${student_phone ? `<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Phone:</strong> ${escHtml(student_phone)}</p>` : ''}
      ${classBlock}
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.8;"><strong>Reason:</strong> ${escHtml(reason)}</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.8;margin-top:8px;">Rejected by ${escHtml(rejected_by)}</p>
    </div>`;
  return {
    subject: 'Student Rejected — WFD EMS',
    html: buildEmailHtml('Student Rejected', bodyHtml),
  };
}
