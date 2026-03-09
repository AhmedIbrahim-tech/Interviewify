"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { questionService } from '@/services/questionService';
import { subCategoryService } from '@/services/subCategoryService';
import { Question } from '@/types/question';
import { SubCategory } from '@/types/category';
import { toast } from 'react-toastify';
import { ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const SubCategoryQuestionsPage = () => {
    const { id } = useParams();
    const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const [subRes, quesRes] = await Promise.all([
                    subCategoryService.getSubCategoryById(Number(id)),
                    questionService.getQuestionsBySubCategory(Number(id))
                ]);
                if (subRes.isSuccess) setSubCategory(subRes.data);
                if (quesRes.isSuccess) setQuestions(quesRes.data);
                if (!subRes.isSuccess) {
                    toast.error(subRes.message || 'Module not found');
                }
            } catch (err) {
                toast.error('Failed to load module');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const categoryId = subCategory?.categoryId ?? (questions[0]?.categoryId);
    const categoryName = questions[0]?.categoryName ?? 'Topic';
    const moduleName = subCategory?.name ?? questions[0]?.subCategoryName ?? 'Module';

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--primary-text)] font-sans selection:bg-[var(--accent)]/30">
            <div className="max-w-5xl mx-auto px-6 py-12 lg:px-8">
                <Link
                    href={categoryId ? `/category/${categoryId}` : '/'}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-text)] hover:text-[var(--accent)] mb-12 transition-all group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {categoryName}
                </Link>

                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Module</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-6 text-[var(--primary-text)]">
                        {moduleName}
                    </h1>
                    <p className="text-[var(--secondary-text)] text-sm font-medium leading-relaxed max-w-2xl">
                        Questions and answers for this module. Click a question to view the full solution.
                    </p>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <Link
                            key={q.id}
                            href={`/question/${q.id}`}
                            className="block p-6 rounded-3xl bg-[var(--card)] border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <span className="text-xs font-black text-[var(--muted-text)] group-hover:text-[var(--accent)] transition-colors">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-lg font-bold text-[var(--secondary-text)] group-hover:text-[var(--primary-text)] transition-colors">
                                        {q.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">View</span>
                                    <ArrowRight size={16} className="text-[var(--accent)]" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {questions.length === 0 && (
                        <div className="p-20 rounded-[40px] bg-[var(--card)] border border-dashed border-[var(--border-color)] text-center">
                            <p className="text-[var(--muted-text)] font-bold mb-2">No questions in this module yet.</p>
                            <p className="text-[var(--muted-text)] text-sm opacity-80">Content may be added later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubCategoryQuestionsPage;
