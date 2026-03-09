"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { categoryService } from '@/services/categoryService';
import { Category, SubCategory } from '@/types/category';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { getCategoryImage } from '@/utils/imageHelpers';

import { questionService } from '@/services/questionService';
import { Question } from '@/types/question';
import { Sparkles, Terminal, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/* Single brand accent for all modules */
const moduleStyles = {
    border: 'hover:border-[var(--accent)]/30',
    badge: 'text-[var(--accent)]',
    btn: 'hover:bg-[var(--accent)] hover:text-white',
    icon: 'text-[var(--accent)]',
};

const CategoryDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, quesRes] = await Promise.all([
                    categoryService.getCategoryById(Number(id)),
                    questionService.getQuestionsByCategory(Number(id))
                ]);

                if (catRes.isSuccess) setCategory(catRes.data);
                if (quesRes.isSuccess) setQuestions(quesRes.data);

                if (!catRes.isSuccess) {
                    toast.error(catRes.message);
                    router.push('/');
                }
            } catch (err) {
                toast.error("Failed to load category experience");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadData();
    }, [id, router]);

    const handleStartJourney = () => {
        if (questions.length > 0) {
            router.push(`/question/${questions[0].id}`);
        } else {
            toast.info("Questions are being prepared for this category.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--primary-text)] font-sans selection:bg-[var(--accent)]/30">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[var(--muted-text)] hover:text-[var(--primary-text)] mb-12 transition-all group"
                >
                    <div className="h-8 w-8 rounded-lg bg-[var(--surface-elevated)] group-hover:bg-[var(--accent)] flex items-center justify-center text-[var(--accent)] group-hover:text-white transition-all underline-none">
                        ←
                    </div>
                    Back to All Tracks
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative h-[450px] w-full rounded-[60px] overflow-hidden shadow-[var(--shadow-lg)] border border-[var(--border-color)] group">
                        <Image
                            src={getCategoryImage(category.name, undefined, Number(category.id))}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent" />
                        <div className="absolute bottom-10 left-10 flex items-center gap-4">
                            <div className="p-4 rounded-3xl bg-[var(--accent-soft)] backdrop-blur-xl border border-[var(--accent)]/20 text-[var(--accent)]">
                                <Sparkles size={24} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">Learning Path</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter mb-8 leading-none text-[var(--primary-text)]">
                            {category.name}
                        </h1>
                        <p className="text-[18px] text-[var(--secondary-text)] leading-relaxed mb-12 max-w-xl font-medium">
                            {category.description || "Master the core concepts and advanced techniques needed to excel in your technical interviews for this domain."}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <button
                                onClick={handleStartJourney}
                                className="px-10 py-5 rounded-3xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-black text-xs uppercase tracking-widest transition-all shadow-[var(--shadow-sm)] active:scale-95 flex items-center gap-3 border border-[var(--accent)]/20"
                            >
                                Start Journey <ArrowRight size={16} strokeWidth={3} />
                            </button>
                            <button className="px-10 py-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 text-[var(--primary-text)]">
                                <BookOpen size={16} /> Library
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-Categories Modules */}
                <div className="mb-32">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--muted-text)]">
                                <Layers size={20} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-[var(--primary-text)]">Modules</h2>
                        </div>
                        <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-widest px-4 py-2 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                            {category.subCategories?.length || 0} modules
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {category.subCategories?.map((sub: SubCategory, idx: number) => (
                            <Link
                                key={sub.id}
                                href={`/subcategory/${sub.id}`}
                                className={`p-10 rounded-[48px] bg-[var(--card)] border border-[var(--border-color)] ${moduleStyles.border} transition-all cursor-pointer group relative overflow-hidden`}
                            >
                                <div className="relative z-10">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${moduleStyles.badge} opacity-70`}>
                                        Module {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <h3 className="text-2xl font-black text-[var(--primary-text)] mb-8 group-hover:translate-x-1 transition-transform">
                                        {sub.name}
                                    </h3>
                                    <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)] ${moduleStyles.btn} transition-all`}>
                                        Explore Module <ArrowRight size={12} strokeWidth={3} />
                                    </div>
                                </div>
                                <div className={`absolute -bottom-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-all ${moduleStyles.icon} rotate-12`}>
                                    <Terminal size={120} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Detailed Questions Repository */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                                <Terminal size={20} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-[var(--primary-text)]">Questions</h2>
                        </div>
                        <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest px-4 py-2 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/20">
                            {questions.length} questions
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {questions.map((q, idx) => (
                            <Link
                                key={q.id}
                                href={`/question/${q.id}`}
                                className="group block p-10 rounded-[40px] bg-[var(--card)] border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-all relative overflow-hidden"
                            >
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-start gap-8">
                                        <div className="mt-1 flex flex-col items-center">
                                            <span className="text-[10px] font-black text-[var(--muted-text)] tracking-[0.2em] uppercase">Ques</span>
                                            <span className="text-[24px] font-black text-[var(--muted-text)] group-hover:text-[var(--accent)] transition-colors leading-none">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-full uppercase tracking-widest border border-[var(--accent)]/20">
                                                    {q.subCategoryName}
                                                </span>
                                            </div>
                                            <h3 className="text-[20px] font-bold text-[var(--secondary-text)] group-hover:text-[var(--primary-text)] transition-colors max-w-2xl leading-snug">
                                                {q.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Expert Insights Available</span>
                                            <span className="text-[var(--muted-text)] text-[11px] font-medium">Mastery Check</span>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--muted-text)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                                            <ArrowRight size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {questions.length === 0 && (
                            <div className="py-32 text-center rounded-[50px] bg-[var(--card)] border border-dashed border-[var(--border-color)]">
                                <p className="text-[var(--muted-text)] font-bold">Curating detailed challenges for this category.</p>
                                <p className="text-[var(--muted-text)] text-sm mt-2 opacity-80">Check back shortly for premium content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CategoryDetailsPage;
