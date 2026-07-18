export function getCalendarFeedUrl(siteUrl: string, studentId: string) {
  return `${siteUrl.replace(/\/+$/, '')}/api/calendar/${encodeURIComponent(studentId)}.ics`;
}
