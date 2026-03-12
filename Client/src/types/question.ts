import type { QuestionLevel } from '@/constants/questionLevels';

/** Lightweight question for lists (no answer body). */
export interface QuestionListItem {
    id: number | string;
    title: string;
    titleAr?: string | null;
    categoryId: number;
    subCategoryId: number;
    level?: QuestionLevel | null;
    isActive: boolean;
    createdAt: string;
    categoryName?: string;
    subCategoryName?: string;
}

/** id is number from API; route params may be string. */
export interface Question {
    id: number | string;
    /** Question title (English). */
    title: string;
    /** Question title (Arabic). Optional. */
    titleAr?: string | null;
    /** Answer in English. May contain Markdown. */
    answer: string;
    /** Answer in Arabic. Optional. May contain Markdown. */
    answerAr?: string | null;
    categoryId: number;
    subCategoryId: number;
    /** Seniority / difficulty level. */
    level?: QuestionLevel | null;
    isActive: boolean;
    createdAt: string;
    categoryName?: string;
    subCategoryName?: string;
}

export interface CreateQuestionDto {
    title: string;
    titleAr?: string | null;
    answer?: string;
    answerAr?: string | null;
    categoryId: number;
    subCategoryId: number;
    level: QuestionLevel;
    isActive?: boolean;
}

export interface UpdateQuestionDto {
    title: string;
    titleAr?: string | null;
    answer?: string;
    answerAr?: string | null;
    categoryId: number;
    subCategoryId: number;
    level: QuestionLevel;
    isActive: boolean;
}
