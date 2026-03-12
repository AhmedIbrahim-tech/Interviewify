export type QuestionLevel = 'Fresh' | 'Junior' | 'MidLevel' | 'Senior';

/** Backend enum values for API query params */
export const QUESTION_LEVEL_VALUES: Record<QuestionLevel, number> = {
  Fresh: 0,
  Junior: 1,
  MidLevel: 2,
  Senior: 3,
};

export const QUESTION_LEVELS: { value: QuestionLevel; label: string }[] = [
  { value: 'Fresh', label: 'Fresh' },
  { value: 'Junior', label: 'Junior' },
  { value: 'MidLevel', label: 'Mid-Level' },
  { value: 'Senior', label: 'Senior' },
];

export function getQuestionLevelLabel(level: QuestionLevel | string | number | null | undefined): string {
  if (level == null || level === '') return '';
  if (typeof level === 'number') {
    const entry = Object.entries(QUESTION_LEVEL_VALUES).find(([, v]) => v === level);
    return entry ? QUESTION_LEVELS.find((l) => l.value === entry[0])?.label ?? String(level) : String(level);
  }
  const found = QUESTION_LEVELS.find((l) => l.value === level);
  return found?.label ?? String(level);
}
