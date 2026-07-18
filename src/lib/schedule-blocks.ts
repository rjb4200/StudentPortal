export type ScheduleBlock = {
  date: string;
  reason: string | null;
};

export function getScheduleBlock(blocks: ScheduleBlock[], date: string) {
  return blocks.find((block) => block.date === date);
}
