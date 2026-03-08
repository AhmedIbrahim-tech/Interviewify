"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionService } from '@/services/questionService';
import { Question } from '@/types/question';
import { toast } from 'react-toastify';

const SubCategoryQuestionsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const response = await questionService.getQuestionsBySubCategory(Number(id));
                if (response.isSuccess) {
                    if (response.data.length > 0) {
                        // Automatically enter immersive mode at the first question
                        router.replace(`/question/${response.data[0].id}`);
                    } else {
                        setQuestions([]);
                    }
                } else {
                    toast.error(response.message);
                }
            } catch (err) {
                toast.error("Failed to load specialization path");
            } finally {
                setLoading(false);
            }
        };

        if (id) loadQuestions();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-500 font-black text-xs">I</div>
                </div>
            </div>
        );
    }

    const categoryId = questions.length > 0 ? questions[0].categoryId : null;
    const subCategoryName = questions.length > 0 ? questions[0].subCategoryName : 'Module';

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600/30">
            <div className="max-w-5xl mx-auto px-6 py-12 lg:px-8">
                <Link
                    href={categoryId ? `/category/${categoryId}` : "/"}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 mb-12 transition-all group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {questions[0]?.categoryName || 'Category'}
                </Link>

                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Learning Path</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-6 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        {subCategoryName}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-2xl">
                        Deepen your understanding through our curated list of technical interview questions and comprehensive answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <Link
                            key={q.id}
                            href={`/question/${q.id}`}
                            className="block p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <span className="text-xs font-black text-gray-600 group-hover:text-blue-500 transition-colors">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors">
                                        {q.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">View Solution</span>
                                    <span className="text-blue-500">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {questions.length === 0 && (
                        <div className="p-20 rounded-[40px] bg-white/[0.01] border border-dashed border-white/10 text-center">
                            <p className="text-gray-500 font-bold mb-2">No questions available yet.</p>
                            <p className="text-gray-600 text-sm">We're working hard to prepare content for this module.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubCategoryQuestionsPage;
