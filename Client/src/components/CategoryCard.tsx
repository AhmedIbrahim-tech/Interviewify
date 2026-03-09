import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types/category';

import { getCategoryImage } from '@/utils/imageHelpers';

const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('c#')) return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    );
    if (lowerName.includes('api') || lowerName.includes('asp')) return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
    if (lowerName.includes('ef') || lowerName.includes('entity') || lowerName.includes('database')) return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    );
    if (lowerName.includes('arch') || lowerName.includes('system')) return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
    if (lowerName.includes('front')) return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
};

interface CategoryCardProps {
    category: Category;
    index?: number;
}

/* Single brand accent – calm, consistent */
const cardStyles = {
    border: 'hover:border-[var(--accent)]/40',
    badge: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20',
    bullet: 'bg-[var(--accent)]',
    button: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--shadow-sm)]',
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index = 0 }) => {
    return (
        <div className={`group relative flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border-color)] ${cardStyles.border} transition-all duration-300 overflow-hidden shadow-[var(--shadow-card)]`}>
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={getCategoryImage(category.name, undefined, index)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[var(--card)] via-transparent to-transparent opacity-80" />

                {/* Icon Overlay */}
                <div className="absolute bottom-4 left-6">
                    <div className={`p-2 rounded-lg ${cardStyles.badge} backdrop-blur-sm transform transition-all group-hover:scale-105`}>
                        {getCategoryIcon(category.name)}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 relative">
                <h3 className="text-xl font-black text-[var(--primary-text)] mb-3 tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
                    {category.name}
                </h3>

                {/* Tech Tags - Subcategories as tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.slice(0, 3).map((sub) => (
                            <span key={sub.id} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[var(--surface-elevated)] text-[var(--muted-text)] uppercase tracking-wider border border-[var(--border-color)]">
                                {sub.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[var(--surface-elevated)] text-[var(--muted-text)] uppercase tracking-wider border border-[var(--border-color)] italic">
                            No Sub-Categories
                        </span>
                    )}
                </div>

                <p className="text-sm text-[var(--secondary-text)] leading-relaxed mb-6 line-clamp-2">
                    {category.description || "Start your interview preparation with our expert-curated questions and paths."}
                </p>

                {/* Bullets - More subcategories as features */}
                <ul className="space-y-2 mb-8 flex-1">
                    {category.subCategories?.slice(3, 6).map((sub) => (
                        <li key={sub.id} className="flex items-center text-[11px] text-[var(--muted-text)] font-medium">
                            <span className={`h-1 w-1 rounded-full ${cardStyles.bullet} mr-3`} />
                            {sub.name}
                        </li>
                    ))}
                    {(!category.subCategories || category.subCategories.length <= 3) && (
                        <li className="flex items-center text-[11px] text-[var(--muted-text)] italic">
                            <span className="h-1 w-1 rounded-full bg-[var(--text-muted)] mr-3" />
                            Explore common questions...
                        </li>
                    )}
                </ul>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
                    <Link
                        href={`/category/${category.id}`}
                        className={`flex-1 inline-flex items-center justify-center h-10 px-4 rounded-xl ${cardStyles.button} text-xs font-bold transition-all active:scale-[0.98]`}
                    >
                        View Details
                    </Link>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--muted-text)] transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;
