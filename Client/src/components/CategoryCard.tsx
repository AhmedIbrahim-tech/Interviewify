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

const THEMES = [
    {
        name: 'blue',
        border: 'hover:border-blue-500/50',
        badge: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
        gradient: 'group-hover:from-blue-400 group-hover:to-indigo-300',
        bullet: 'bg-blue-500 shadow-[0_0_5px_#3b82f6]',
        button: 'bg-blue-600/90 hover:bg-blue-500 shadow-blue-500/20'
    },
    {
        name: 'purple',
        border: 'hover:border-purple-500/50',
        badge: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
        gradient: 'group-hover:from-purple-400 group-hover:to-pink-300',
        bullet: 'bg-purple-500 shadow-[0_0_5px_#a855f7]',
        button: 'bg-purple-600/90 hover:bg-purple-500 shadow-purple-500/20'
    },
    {
        name: 'emerald',
        border: 'hover:border-emerald-500/50',
        badge: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
        gradient: 'group-hover:from-emerald-400 group-hover:to-teal-300',
        bullet: 'bg-emerald-500 shadow-[0_0_5px_#10b981]',
        button: 'bg-emerald-600/90 hover:bg-emerald-500 shadow-emerald-500/20'
    },
    {
        name: 'amber',
        border: 'hover:border-amber-500/50',
        badge: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
        gradient: 'group-hover:from-amber-400 group-hover:to-orange-300',
        bullet: 'bg-amber-500 shadow-[0_0_5px_#f59e0b]',
        button: 'bg-amber-600/90 hover:bg-amber-500 shadow-amber-500/20'
    },
    {
        name: 'rose',
        border: 'hover:border-rose-500/50',
        badge: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
        gradient: 'group-hover:from-rose-400 group-hover:to-red-300',
        bullet: 'bg-rose-500 shadow-[0_0_5px_#f43f5e]',
        button: 'bg-rose-600/90 hover:bg-rose-500 shadow-rose-500/20'
    }
];

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index = 0 }) => {
    const theme = THEMES[index % THEMES.length];

    return (
        <div className={`group relative flex flex-col bg-[#0a0a0c] rounded-2xl border border-white/5 ${theme.border} transition-all duration-500 overflow-hidden shadow-2xl`}>
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={getCategoryImage(category.name, category.image, index)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />

                {/* Icon Overlay */}
                <div className="absolute bottom-4 left-6">
                    <div className={`p-2 rounded-lg ${theme.badge} backdrop-blur-md transform transition-all group-hover:scale-110 group-hover:rotate-6`}>
                        {getCategoryIcon(category.name)}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 relative">
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                    <span className={`bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent ${theme.gradient} transition-all duration-300`}>
                        {category.name}
                    </span>
                </h3>

                {/* Tech Tags - Subcategories as tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.slice(0, 3).map((sub) => (
                            <span key={sub.id} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/5 text-gray-400 uppercase tracking-wider border border-white/5">
                                {sub.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/5 text-gray-500 uppercase tracking-wider border border-white/5 italic">
                            No Sub-Categories
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-2">
                    {category.description || "Start your interview preparation with our expert-curated questions and paths."}
                </p>

                {/* Bullets - More subcategories as features */}
                <ul className="space-y-2 mb-8 flex-1">
                    {category.subCategories?.slice(3, 6).map((sub) => (
                        <li key={sub.id} className="flex items-center text-[11px] text-gray-500 font-medium">
                            <span className={`h-1 w-1 rounded-full ${theme.bullet} mr-3`} />
                            {sub.name}
                        </li>
                    ))}
                    {(!category.subCategories || category.subCategories.length <= 3) && (
                        <li className="flex items-center text-[11px] text-gray-600 italic">
                            <span className="h-1 w-1 rounded-full bg-gray-700 mr-3" />
                            Explore common questions...
                        </li>
                    )}
                </ul>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <Link
                        href={`/category/${category.id}`}
                        className={`flex-1 inline-flex items-center justify-center h-10 px-4 rounded-xl ${theme.button} text-white text-xs font-bold transition-all transform active:scale-95 shadow-lg`}
                    >
                        View Details
                    </Link>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
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
