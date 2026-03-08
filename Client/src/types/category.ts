export interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
    categoryName?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    subCategories: SubCategory[];
}
