export type ScheduleBlock = {
  date: string;
  reason: string | null;
};

type ScheduleForRange = { date: string; status: string };

export type ScheduleBlockRangeSummary = {
  totalDays: number;
  alreadyBlocked: number;
  pendingSchedules: number;
  approvedSchedules: number;
};

export function getScheduleBlock(blocks: ScheduleBlock[], date: string) {
  return blocks.find((block) => block.date === date);
}

export function getScheduleBlockRangeSummary(
  startDate: string,
  endDate: string,
  blocks: ScheduleBlock[],
  schedules: ScheduleForRange[],
): ScheduleBlockRangeSummary | null {
  if (endDate < startDate) return null;

  const dates = new Set<string>();
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    dates.add(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return {
    totalDays: dates.size,
    alreadyBlocked: blocks.filter((block) => dates.has(block.date)).length,
    pendingSchedules: schedules.filter((schedule) => dates.has(schedule.date) && schedule.status === 'pending').length,
    approvedSchedules: schedules.filter((schedule) => dates.has(schedule.date) && schedule.status === 'approved').length,
  };
}
