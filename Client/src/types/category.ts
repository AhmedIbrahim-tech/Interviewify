/** id/categoryId are number from API; route params may be string. */
export interface SubCategory {
    id: number | string;
    name: string;
    categoryId: number | string;
    displayOrder?: number;
    categoryName?: string;
}

export interface Category {
    id: number | string;
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
    subCategories: SubCategory[];
}
