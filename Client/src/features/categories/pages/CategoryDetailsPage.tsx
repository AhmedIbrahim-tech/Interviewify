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

const SUB_THEMES = [
    { border: 'hover:border-blue-500/30', icon: 'text-blue-500', text: 'group-hover:text-blue-400', badge: 'text-blue-500', btn: 'hover:bg-blue-600' },
    { border: 'hover:border-purple-500/30', icon: 'text-purple-500', text: 'group-hover:text-purple-400', badge: 'text-purple-500', btn: 'hover:bg-purple-600' },
    { border: 'hover:border-emerald-500/30', icon: 'text-emerald-500', text: 'group-hover:text-emerald-400', badge: 'text-emerald-500', btn: 'hover:bg-emerald-600' },
    { border: 'hover:border-amber-500/30', icon: 'text-amber-500', text: 'group-hover:text-amber-400', badge: 'text-amber-500', btn: 'hover:bg-amber-600' },
    { border: 'hover:border-rose-500/30', icon: 'text-rose-500', text: 'group-hover:text-rose-400', badge: 'text-rose-500', btn: 'hover:bg-rose-600' },
];

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
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="relative scale-150">
                    <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-500 font-black text-xs">I</div>
                </div>
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-600/30">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white mb-12 transition-all group"
                >
                    <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-indigo-600 flex items-center justify-center transition-all underline-none">
                        ←
                    </div>
                    Back to All Tracks
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative h-[450px] w-full rounded-[60px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5 group">
                        <Image
                            src={getCategoryImage(category.name, category.image, Number(category.id))}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                        <div className="absolute bottom-10 left-10 flex items-center gap-4">
                            <div className="p-4 rounded-3xl bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 text-indigo-400">
                                <Sparkles size={24} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500">Learning Path</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter mb-8 leading-none bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            {category.name}
                        </h1>
                        <p className="text-[18px] text-gray-400 leading-relaxed mb-12 max-w-xl font-medium">
                            {category.description || "Master the core concepts and advanced techniques needed to excel in your technical interviews for this domain."}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <button
                                onClick={handleStartJourney}
                                className="px-10 py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-500 font-black text-xs uppercase tracking-widest transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 flex items-center gap-3 ring-1 ring-white/10"
                            >
                                Start Journey <ArrowRight size={16} strokeWidth={3} />
                            </button>
                            <button className="px-10 py-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3">
                                <BookOpen size={16} /> Library
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-Categories Modules */}
                <div className="mb-32">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                                <Layers size={20} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Structured Modules</h2>
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                            {category.subCategories?.length || 0} Specializations
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {category.subCategories?.map((sub: SubCategory, idx: number) => {
                            const theme = SUB_THEMES[idx % SUB_THEMES.length];
                            return (
                                <Link
                                    key={sub.id}
                                    href={`/subcategory/${sub.id}`}
                                    className={`p-10 rounded-[48px] bg-white/[0.02] border border-white/5 ${theme.border} transition-all cursor-pointer group relative overflow-hidden`}
                                >
                                    <div className="relative z-10">
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${theme.badge} opacity-50`}>
                                            Module {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-8 group-hover:translate-x-1 transition-transform">
                                            {sub.name}
                                        </h3>
                                        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl bg-white/5 border border-white/5 ${theme.btn} hover:text-white transition-all`}>
                                            Explore Module <ArrowRight size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                    {/* Abstract background icon */}
                                    <div className={`absolute -bottom-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-all ${theme.icon} rotate-12`}>
                                        <Terminal size={120} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Questions Repository */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                                <Terminal size={20} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Challenge Repository</h2>
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-4 py-2 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
                            {questions.length} Active Challenges
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {questions.map((q, idx) => (
                            <Link
                                key={q.id}
                                href={`/question/${q.id}`}
                                className="group block p-10 rounded-[40px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-indigo-500/20 transition-all relative overflow-hidden"
                            >
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-start gap-8">
                                        <div className="mt-1 flex flex-col items-center">
                                            <span className="text-[10px] font-black text-gray-700 tracking-[0.2em] uppercase">Ques</span>
                                            <span className="text-[24px] font-black text-gray-700 group-hover:text-indigo-500 transition-colors leading-none">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
                                                    {q.subCategoryName}
                                                </span>
                                            </div>
                                            <h3 className="text-[20px] font-bold text-gray-200 group-hover:text-white transition-colors max-w-2xl leading-snug">
                                                {q.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Expert Insights Available</span>
                                            <span className="text-gray-500 text-[11px] font-medium">Mastery Check</span>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ArrowRight size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {questions.length === 0 && (
                            <div className="py-32 text-center rounded-[50px] bg-white/[0.01] border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold">Curating detailed challenges for this category.</p>
                                <p className="text-gray-600 text-sm mt-2">Check back shortly for premium content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CategoryDetailsPage;
