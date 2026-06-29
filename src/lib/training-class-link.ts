export type TrainingClassLinkOption = {
  id: string;
};

export function getLinkedTrainingClass<T extends TrainingClassLinkOption>(options: T[], linkedClassId?: string | null): T | null {
  const classId = linkedClassId?.trim();
  if (!classId) return null;
  return options.find((option) => option.id === classId) ?? null;
}
