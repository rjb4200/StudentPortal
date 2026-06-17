interface ScheduleRecord {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
  student_name?: string;
}

export function generateICalFeed(schedules: ScheduleRecord[], calendarName: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WFD EMS Student Portal//EN',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-CALDESC:WFD EMS Student Rotation Schedule',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const statusColors: Record<string, string> = {
    pending: '#D4AF37',
    approved: '#B61C20',
    rejected: '#9CA3AF',
    cancelled: '#D97706',
  };

  for (const s of schedules) {
    const dt = s.date.replace(/-/g, '');
    const timeStr = s.start_time && s.end_time ? ` (${s.start_time} – ${s.end_time})` : '';
    const summary = s.student_name
      ? `${s.student_name}${timeStr}`
      : `${s.shift_type} shift${timeStr}`;

    const desc = s.start_time && s.end_time
      ? `Status: ${s.status}\\nTime: ${s.start_time} – ${s.end_time}`
      : `Status: ${s.status}\\nShift: ${s.shift_type}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${s.id}@wfd-ems-portal`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push(`CATEGORIES:${s.status === 'approved' ? 'Approved' : s.status === 'pending' ? 'Pending' : 'Rejected'}`);
    lines.push(`X-STATUS:${s.status}`);
    lines.push(`COLOR:${statusColors[s.status] || '#9CA3AF'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
