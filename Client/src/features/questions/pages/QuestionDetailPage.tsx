"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionService } from '@/services/questionService';
import { Question } from '@/types/question';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Terminal, Layers, Home } from 'lucide-react';

const QuestionDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [siblings, setSiblings] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch the current question
                const response = await questionService.getQuestionById(Number(id));
                if (response.isSuccess) {
                    const currentQ = response.data;
                    setQuestion(currentQ);

                    // Fetch siblings (all questions in the same subcategory)
                    const siblingsRes = await questionService.getQuestionsBySubCategory(currentQ.subCategoryId);
                    if (siblingsRes.isSuccess) {
                        setSiblings(siblingsRes.data);
                    }
                } else {
                    toast.error(response.message);
                }
            } catch (err) {
                toast.error("Failed to load question details");
            } finally {
                setLoading(false);
            }
        };

        if (id) loadData();
    }, [id]);

    const currentIndex = siblings.findIndex(s => String(s.id) === String(id));
    const nextQuestion = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
    const prevQuestion = currentIndex !== -1 && currentIndex > 0 ? siblings[currentIndex - 1] : null;

    const navigateTo = (qid: string) => {
        router.push(`/question/${qid}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!question) return null;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--primary-text)] font-sans selection:bg-[var(--accent)]/30 overflow-hidden flex relative">

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 w-[340px] bg-[var(--sidebar)] border-r border-[var(--border-color)] z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex lg:flex-col'}`}>

                <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--surface-elevated)]">
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-1">Interactive Index</h2>
                        <h3 className="text-[15px] font-bold text-[var(--secondary-text)] line-clamp-1">{question.subCategoryName}</h3>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[var(--muted-text)] hover:text-[var(--primary-text)] p-2 hover:bg-[var(--surface-elevated)] rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar scroll-smooth">
                    {siblings.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => {
                                navigateTo(String(s.id));
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`w-full text-left p-4 rounded-2xl transition-all group flex items-start gap-4 border
                                ${id === s.id
                                    ? 'bg-[var(--accent)] border-[var(--accent)]/50 text-white shadow-[var(--shadow-md)] scale-[1.02]'
                                    : 'bg-transparent border-transparent text-[var(--muted-text)] hover:bg-[var(--surface-elevated)] hover:text-[var(--secondary-text)] hover:border-[var(--border-color)]'}`}
                        >
                            <span className={`text-[11px] font-black mt-1 ${id === s.id ? 'text-white/80' : 'text-[var(--muted-text)] transition-colors group-hover:text-[var(--accent)]'}`}>
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[13px] font-bold leading-snug line-clamp-2">{s.title}</span>
                        </button>
                    ))}
                    {siblings.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-[var(--muted-text)] text-[11px] font-bold uppercase tracking-widest">No siblings found</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-[var(--border-color)] bg-[var(--surface-elevated)] space-y-4">
                    <Link href="/" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted-text)] hover:text-[var(--primary-text)] transition-all group">
                        <div className="h-8 w-8 rounded-lg bg-[var(--surface-elevated)] group-hover:bg-[var(--accent)] flex items-center justify-center text-[var(--accent)] group-hover:text-white transition-all">
                            <Home size={14} />
                        </div>
                        Home Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Immersive Shell */}
            <main className="flex-1 relative flex flex-col min-h-screen overflow-y-auto no-scrollbar scroll-smooth">

                {/* Visual Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[160px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[140px] -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="lg:hidden sticky top-0 bg-[var(--background)]/95 backdrop-blur-xl z-30 px-6 h-18 flex items-center justify-between border-b border-[var(--border-color)] shadow-[var(--shadow-md)]">
                    <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-md)]">
                        <Menu size={20} />
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[var(--accent)] tracking-[0.2em] uppercase">Curated Step</span>
                        <span className="text-[13px] font-black text-[var(--primary-text)]">{currentIndex + 1} / {siblings.length}</span>
                    </div>
                </div>

                {/* Primary Content Area */}
                <div className="max-w-4xl mx-auto w-full px-6 py-12 lg:py-24 flex-1 relative z-10">

                    {/* Floating Toggle Trigger (Desktop Only) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 h-16 w-16 rounded-[24px] bg-[var(--card)] border border-[var(--border-color)] items-center justify-center transition-all shadow-[var(--shadow-lg)] z-20 group 
                            ${isSidebarOpen ? 'text-[var(--danger)] border-[var(--danger)]/30 rotate-90 scale-90' : 'text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white hover:scale-110 active:scale-95'}`}
                    >
                        {isSidebarOpen ? <X size={28} /> : <Layers size={28} className="group-hover:rotate-12 transition-transform" />}
                    </button>

                    <article className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                                <Terminal size={24} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Question</span>
                                <h1 className="text-[28px] md:text-[48px] font-black text-[var(--primary-text)] leading-[1.1] tracking-tighter max-w-3xl">
                                    {question.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-16 px-1">
                            <span className="px-5 py-2.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[11px] font-black uppercase tracking-widest text-[var(--muted-text)] transition-all cursor-default">
                                {question.categoryName}
                            </span>
                            <span className="px-5 py-2.5 rounded-2xl bg-[var(--accent)] text-[11px] font-black uppercase tracking-widest text-white shadow-[var(--shadow-sm)]">
                                {question.subCategoryName}
                            </span>
                        </div>
                    </article>

                    {/* Answer Section */}
                    <section className="relative group/answer">
                        <div className="p-10 md:p-14 rounded-[48px] bg-[var(--card)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-[20px] bg-[var(--accent)] flex items-center justify-center text-white shadow-[var(--shadow-sm)]">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-[var(--primary-text)] leading-none uppercase tracking-tight">Answer</h2>
                                    <p className="text-[11px] font-bold text-[var(--muted-text)] uppercase tracking-widest mt-1">Model answer and explanation</p>
                                </div>
                            </div>

                            <div className="prose prose-xl max-w-none">
                                <div className="text-[var(--secondary-text)] leading-relaxed text-[18px] md:text-[20px] whitespace-pre-wrap font-medium tracking-tight selection:bg-[var(--accent)]/30">
                                    {question.answer || 'No answer has been added yet.'}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Fixed Center Navigation Interface */}
                <div className="sticky bottom-0 w-full py-16 flex justify-center pointer-events-none z-40">
                    <div className="flex items-center gap-6 pointer-events-auto bg-[var(--card)]/95 backdrop-blur-xl px-3 py-3 rounded-[32px] border border-[var(--border-color)] shadow-[var(--shadow-lg)] transition-all hover:border-[var(--accent)]/40 scale-110 md:scale-125 ring-1 ring-[var(--border-color)] active:scale-105">
                        <button
                            disabled={!prevQuestion}
                            onClick={() => prevQuestion && navigateTo(String(prevQuestion.id))}
                            className={`h-12 w-12 rounded-[20px] flex items-center justify-center transition-all bg-[var(--surface-elevated)]
                                ${!prevQuestion
                                    ? 'text-[var(--muted-text)] cursor-not-allowed opacity-40'
                                    : 'text-[var(--primary-text)] hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)] active:scale-90 hover:scale-105'}`}
                        >
                            <ChevronLeft size={28} strokeWidth={3} />
                        </button>

                        <div className="px-6 flex flex-col items-center justify-center min-w-[120px]">
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-black text-[var(--primary-text)] tabular-nums tracking-tighter leading-none">{currentIndex + 1}</span>
                                <span className="text-[12px] font-black text-[var(--muted-text)] uppercase tracking-widest">/ {siblings.length}</span>
                            </div>
                            <div className="w-16 h-1 bg-[var(--surface-elevated)] rounded-full relative overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-all duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1) rounded-full"
                                    style={{ width: `${((currentIndex + 1) / siblings.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!nextQuestion}
                            onClick={() => nextQuestion && navigateTo(String(nextQuestion.id))}
                            className={`h-12 w-12 rounded-[20px] flex items-center justify-center transition-all bg-[var(--surface-elevated)]
                                ${!nextQuestion
                                    ? 'text-[var(--muted-text)] cursor-not-allowed opacity-40'
                                    : 'text-[var(--primary-text)] hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)] active:scale-90 hover:scale-105'}`}
                        >
                            <ChevronRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};


export default QuestionDetailPage;
