interface ScheduleRecord {
  id: string;
  date: string;
  shift_type: 'full' | 'day' | 'night';
  status: 'pending' | 'approved' | 'rejected';
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
  };

  for (const s of schedules) {
    const dt = s.date.replace(/-/g, '');
    const summary = s.student_name
      ? `${s.student_name} — ${s.shift_type} shift`
      : `${s.shift_type} shift`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${s.id}@wfd-ems-portal`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:Status: ${s.status}\\nShift: ${s.shift_type}`);
    lines.push(`CATEGORIES:${s.status === 'approved' ? 'Approved' : s.status === 'pending' ? 'Pending' : 'Rejected'}`);
    lines.push(`X-STATUS:${s.status}`);
    lines.push(`COLOR:${statusColors[s.status] || '#9CA3AF'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
