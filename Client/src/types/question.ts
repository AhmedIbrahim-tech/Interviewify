export interface Question {
    id: string;
    title: string;
    answer: string;
    categoryId: number;
    subCategoryId: number;
    isActive: boolean;
    createdAt: string;
    categoryName?: string;
    subCategoryName?: string;
}

export interface CreateQuestionDto {
    title: string;
    answer: string;
    categoryId: number;
    subCategoryId: number;
    isActive?: boolean;
}

export interface UpdateQuestionDto {
    title: string;
    answer: string;
    isActive: boolean;
}
