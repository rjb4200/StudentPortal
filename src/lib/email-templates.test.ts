import { describe, it, expect } from 'vitest';
import {
  buildStudentApprovalEmail,
  buildOnboardingCompleteStudentEmail,
  buildOnboardingCompleteAdminEmail,
  buildShiftCancelledByStudentEmail,
  buildShiftCancelledByStudentAdminEmail,
  buildShiftApprovedEmail,
  buildShiftCancelledByAdminEmail,
  buildShiftRejectedEmail,
  buildEvaluationReceiptEmail,
  buildFlaggedEvaluationEmail,
} from '@/lib/email-templates';

function containsNoRawSpecialChars(html: string, original: string): boolean {
  for (const char of original) {
    if (char === '<' && html.includes('<') && !html.includes('&lt;')) {
      return false;
    }
    if (char === '>' && html.includes('>') && !html.includes('&gt;')) {
      return false;
    }
  }
  return true;
}

describe('buildStudentApprovalEmail', () => {
  it('escapes special characters in name', () => {
    const result = buildStudentApprovalEmail({
      full_name: `O'Brien <test@evil.com>`,
      login_url: 'https://example.com/login',
    });
    expect(result.html).toContain('O&#39;Brien &lt;test@evil.com&gt;');
    expect(result.html).not.toContain(`O'Brien <test@evil.com>`);
    expect(result.subject).toBe('WFD EMS Student Portal — Account Approved');
  });

  it('renders normal name correctly', () => {
    const result = buildStudentApprovalEmail({
      full_name: 'John Smith',
      login_url: 'https://example.com/login',
    });
    expect(result.html).toContain('Hi John Smith');
    expect(result.html).toContain('Go to Student Portal Login');
  });
});

describe('buildOnboardingCompleteStudentEmail', () => {
  it('escapes special characters in email', () => {
    const result = buildOnboardingCompleteStudentEmail({
      email: `"user"@school.edu`,
      temp_password: '123456',
      login_url: 'https://example.com/login',
    });
    expect(result.html).toContain('&quot;user&quot;@school.edu');
    expect(result.html).not.toContain(`"user"@school.edu`);
  });

  it('handles null password gracefully', () => {
    const result = buildOnboardingCompleteStudentEmail({
      email: 'student@test.com',
      temp_password: null,
      login_url: 'https://example.com/login',
    });
    expect(result.html).toContain('Use your existing WFD password');
    expect(result.html).not.toContain('123456');
  });
});

describe('buildOnboardingCompleteAdminEmail', () => {
  it('escapes name, email, and school', () => {
    const result = buildOnboardingCompleteAdminEmail({
      full_name: `Evil <x>`,
      email: `"admin"@test.com`,
      school_name: `School "A" & B`,
    });
    expect(result.html).toContain('Evil &lt;x&gt;');
    expect(result.html).toContain('&quot;admin&quot;@test.com');
    expect(result.html).toContain('School &quot;A&quot; &amp; B');
    expect(result.html).not.toContain('Evil <x>');
    expect(result.html).not.toContain('"admin"@test.com');
  });

  it('renders selected class context when available', () => {
    const result = buildOnboardingCompleteAdminEmail({
      full_name: 'Student One',
      email: 'student@example.com',
      school_name: 'Legacy School',
      class_name: 'Summer Cohort',
      class_start_date: '2026-07-01',
      ride_time_end_date: '2026-08-01',
      site_name: 'Training Site A',
      selected_instructor_name: 'Jane Instructor',
      selected_instructor_contact: 'jane@example.com',
    });

    expect(result.html).toContain('Training Site A');
    expect(result.html).toContain('Summer Cohort');
    expect(result.html).toContain('Jane Instructor');
    expect(result.html).toContain('jane@example.com');
  });
});

describe('buildShiftCancelledByStudentEmail', () => {
  it('escapes name, date, time, and note', () => {
    const result = buildShiftCancelledByStudentEmail({
      full_name: `O'Brien <x>`,
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 &ndash; 17:00',
      note: `<script>alert("xss")</script> & urgent`,
      login_url: 'https://example.com/dashboard',
    });
    expect(result.html).toContain('O&#39;Brien &lt;x&gt;');
    expect(result.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; urgent');
    expect(result.html).not.toContain('<script>');
    expect(result.subject).toBe('Shift Cancelled — WFD EMS Student Portal');
  });

  it('handles null note', () => {
    const result = buildShiftCancelledByStudentEmail({
      full_name: 'John Smith',
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 – 17:00',
      note: null,
      login_url: 'https://example.com/dashboard',
    });
    expect(result.html).toContain('Hi John Smith');
    expect(result.html).not.toContain('<strong>Note:</strong>');
  });
});

describe('buildShiftCancelledByStudentAdminEmail', () => {
  it('escapes name and note for admin notification', () => {
    const result = buildShiftCancelledByStudentAdminEmail({
      full_name: `Student "A" & B`,
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 – 17:00',
      note: 'Please cancel &mdash; urgent',
    });
    expect(result.html).toContain('Student &quot;A&quot; &amp; B');
    expect(result.html).toContain('Please cancel &amp;mdash; urgent');
    expect(result.subject).toBe('Student Shift Cancellation — WFD EMS');
  });
});

describe('buildShiftApprovedEmail', () => {
  it('escapes name in approval', () => {
    const result = buildShiftApprovedEmail({
      full_name: `O'Brien`,
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 – 17:00',
      login_url: 'https://example.com/dashboard',
    });
    expect(result.html).toContain('O&#39;Brien');
    expect(result.subject).toBe('Shift Approved — WFD EMS Student Portal');
  });
});

describe('buildShiftCancelledByAdminEmail', () => {
  it('escapes name and admin note', () => {
    const result = buildShiftCancelledByAdminEmail({
      full_name: `O'Brien`,
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 – 17:00',
      note: 'Class cancelled due to weather & ice',
      login_url: 'https://example.com/dashboard',
    });
    expect(result.html).toContain('O&#39;Brien');
    expect(result.html).toContain('Class cancelled due to weather &amp; ice');
    expect(result.subject).toBe('Shift Cancelled — WFD EMS Student Portal');
  });
});

describe('buildShiftRejectedEmail', () => {
  it('escapes name in rejection', () => {
    const result = buildShiftRejectedEmail({
      full_name: `Evil <x>`,
      date_str: 'Monday, June 19, 2026',
      time_display: '08:00 – 17:00',
      login_url: 'https://example.com/dashboard',
    });
    expect(result.html).toContain('Evil &lt;x&gt;');
    expect(result.subject).toBe('Shift Request Update — WFD EMS Student Portal');
  });
});

describe('buildEvaluationReceiptEmail', () => {
  it('escapes name in receipt', () => {
    const result = buildEvaluationReceiptEmail({
      full_name: `O'Brien "Ace"`,
    });
    expect(result.html).toContain('O&#39;Brien &quot;Ace&quot;');
    expect(result.subject).toBe('Evaluation Receipt — WFD EMS Student Portal');
  });
});

describe('buildFlaggedEvaluationEmail', () => {
  it('escapes student and preceptor names', () => {
    const result = buildFlaggedEvaluationEmail({
      student_name: `Evil <x>`,
      preceptor_name: `Dr. "Ace" & Son`,
      overall_rating: 2,
    });
    expect(result.html).toContain('Evil &lt;x&gt;');
    expect(result.html).toContain('Dr. &quot;Ace&quot; &amp; Son');
    expect(result.html).toContain('(2/5)');
    expect(result.subject).toBe('WFD EMS: Flagged Evaluation');
  });
});
