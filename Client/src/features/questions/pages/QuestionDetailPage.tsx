"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionService } from '@/services/questionService';
import { Question } from '@/types/question';
import { toast } from 'react-toastify';

import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Terminal, ArrowRight, Layers, Sparkles, Home } from 'lucide-react';

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

    const currentIndex = siblings.findIndex(s => s.id === id);
    const nextQuestion = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
    const prevQuestion = currentIndex !== -1 && currentIndex > 0 ? siblings[currentIndex - 1] : null;

    const navigateTo = (qid: string) => {
        router.push(`/question/${qid}`);
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

    if (!question) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-600/30 overflow-hidden flex relative">

            {/* Sidebar Overlay (Mobile Only) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar: Question Index Index */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-[340px] bg-[#0a0a0c] border-r border-white/5 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex lg:flex-col'}`}>

                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">Interactive Index</h2>
                        <h3 className="text-[15px] font-bold text-gray-200 line-clamp-1">{question.subCategoryName}</h3>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar scroll-smooth">
                    {siblings.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => {
                                navigateTo(s.id);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`w-full text-left p-4 rounded-2xl transition-all group flex items-start gap-4 border
                                ${id === s.id
                                    ? 'bg-indigo-600 border-indigo-500/50 text-white shadow-xl shadow-indigo-600/10 scale-[1.02]'
                                    : 'bg-transparent border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-gray-200 hover:border-white/5'}`}
                        >
                            <span className={`text-[11px] font-black mt-1 ${id === s.id ? 'text-indigo-200' : 'text-gray-700 transition-colors group-hover:text-indigo-500'}`}>
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[13px] font-bold leading-snug line-clamp-2">{s.title}</span>
                        </button>
                    ))}
                    {siblings.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest">No siblings found</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-white/5 bg-white/[0.01] space-y-4">
                    <Link href="/" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all group">
                        <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-indigo-600 flex items-center justify-center transition-all">
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
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[160px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Mobile Identity Bar */}
                <div className="lg:hidden sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-30 px-6 h-18 flex items-center justify-between border-b border-white/5 shadow-2xl">
                    <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                        <Menu size={20} />
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase">Curated Step</span>
                        <span className="text-[13px] font-black text-white">{currentIndex + 1} / {siblings.length}</span>
                    </div>
                </div>

                {/* Primary Content Area */}
                <div className="max-w-4xl mx-auto w-full px-6 py-12 lg:py-24 flex-1 relative z-10">

                    {/* Floating Toggle Trigger (Desktop Only) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 h-16 w-16 rounded-[24px] bg-[#0a0a0c] border border-white/5 items-center justify-center transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 group 
                            ${isSidebarOpen ? 'text-red-500 border-red-500/20 rotate-90 scale-90' : 'text-indigo-500 hover:bg-indigo-600 hover:text-white hover:scale-110 active:scale-95'}`}
                    >
                        {isSidebarOpen ? <X size={28} /> : <Layers size={28} className="group-hover:rotate-12 transition-transform" />}
                    </button>

                    {/* Question Header */}
                    <article className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-inner">
                                <Terminal size={24} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-amber-400" />
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500">Premium Interview Intelligence</span>
                                </div>
                                <h1 className="text-[28px] md:text-[48px] font-black text-white leading-[1.1] tracking-tighter max-w-3xl">
                                    {question.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-16 px-1">
                            <span className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest text-[#94a3b8] grayscale hover:grayscale-0 transition-all cursor-default">
                                {question.categoryName}
                            </span>
                            <span className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_10px_25px_rgba(79,70,229,0.3)]">
                                {question.subCategoryName}
                            </span>
                        </div>
                    </article>

                    {/* Immersive Solution Section */}
                    <section className="relative group/answer">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-[48px] blur-[100px] opacity-0 group-hover/answer:opacity-100 transition-opacity duration-1000" />

                        <div className="p-10 md:p-14 rounded-[48px] bg-[#0a0a0c]/80 border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden backdrop-blur-3xl ring-1 ring-white/5 group-hover/answer:ring-white/10 transition-all">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-white leading-none mb-1.5 uppercase tracking-tight">Technical Analysis</h2>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Verified Mastery Standards 2025
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity">
                                    <span className="text-[24px] font-black text-white tracking-widest">.NET 9+</span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Industry Core</span>
                                </div>
                            </div>

                            <div className="prose prose-indigo prose-xl max-w-none">
                                <p className="text-[#cbd5e1] leading-relaxed text-[20px] md:text-[22px] whitespace-pre-wrap font-medium tracking-tight selection:bg-indigo-600/50">
                                    {question.answer}
                                </p>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-indigo-600/10 rounded-full blur-2xl group-hover/answer:scale-150 transition-transform duration-1000" />
                        </div>
                    </section>
                </div>

                {/* Fixed Center Navigation Interface */}
                <div className="sticky bottom-0 w-full py-16 flex justify-center pointer-events-none z-40">
                    <div className="flex items-center gap-6 pointer-events-auto bg-[#0a0a0c]/70 backdrop-blur-[24px] px-3 py-3 rounded-[32px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all hover:border-indigo-500/50 scale-110 md:scale-125 ring-1 ring-white/5 active:scale-105">
                        <button
                            disabled={!prevQuestion}
                            onClick={() => prevQuestion && navigateTo(prevQuestion.id)}
                            className={`h-12 w-12 rounded-[20px] flex items-center justify-center transition-all bg-white/5
                                ${!prevQuestion
                                    ? 'text-gray-800 cursor-not-allowed opacity-30 shadow-inner'
                                    : 'text-white hover:bg-white/10 hover:text-indigo-400 active:scale-90 hover:scale-105'}`}
                        >
                            <ChevronLeft size={28} strokeWidth={3} />
                        </button>

                        <div className="px-6 flex flex-col items-center justify-center min-w-[120px]">
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-[20px] font-black text-white tabular-nums tracking-tighter leading-none">{currentIndex + 1}</span>
                                <span className="text-[12px] font-black text-indigo-500/50 uppercase tracking-widest">/ {siblings.length}</span>
                            </div>
                            <div className="w-16 h-1 bg-white/5 rounded-full relative overflow-hidden ring-1 ring-white/5 shadow-inner">
                                <div
                                    className="absolute inset-y-0 left-0 bg-indigo-600 transition-all duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1) rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                                    style={{ width: `${((currentIndex + 1) / siblings.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!nextQuestion}
                            onClick={() => nextQuestion && navigateTo(nextQuestion.id)}
                            className={`h-12 w-12 rounded-[20px] flex items-center justify-center transition-all bg-white/5
                                ${!nextQuestion
                                    ? 'text-gray-800 cursor-not-allowed opacity-30 shadow-inner'
                                    : 'text-white hover:bg-white/10 hover:text-indigo-400 active:scale-90 hover:scale-105'}`}
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
