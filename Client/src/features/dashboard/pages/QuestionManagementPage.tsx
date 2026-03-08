"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { DataGrid } from '@/components/shared/DataGrid';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LookupSelect } from '@/components/shared/LookupSelect';
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    X,
    Pencil,
    Trash2,
    FileQuestion,
    CheckCircle2,
    Clock,
    ChevronDown,
    Shield,
    FolderOpen,
    GitBranch
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchQuestions, addQuestion, editQuestion, removeQuestion } from '@/store/slices/questionSlice';
import { fetchCategories, fetchSubCategories } from '@/store/slices/lookupSlice';
import { Question } from '@/types/question';
import { toast } from 'react-toastify';

const QuestionManagementPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const dispatch = useAppDispatch();
    const { items: questions, loading: qLoading } = useAppSelector(state => state.questions);
    const { categories, subCategories } = useAppSelector(state => state.lookups);

    const loading = qLoading;
    const [search, setSearch] = useState(initialSearch);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        answer: '',
        categoryId: '',
        subCategoryId: '',
        isActive: true
    });
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

    useEffect(() => {
        dispatch(fetchQuestions());
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (formData.categoryId) {
            dispatch(fetchSubCategories(parseInt(formData.categoryId)));
        }
    }, [dispatch, formData.categoryId]);

    const columns: Column<Question>[] = [
        {
            header: 'Question',
            key: 'title',
            render: (q: Question) => (
                <div className="max-w-[350px]">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1 mb-0.5">{q.title}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--primary)] font-medium">{q.categoryName}</span>
                        <span className="text-[var(--text-light)]">·</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{q.subCategoryName}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Created',
            key: 'createdAt',
            render: (q: Question) => (
                <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
                    <Clock size={13} />
                    {new Date(q.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'isActive',
            render: (q: Question) => (
                <StatusBadge
                    label={q.isActive ? 'Active' : 'Draft'}
                    variant={q.isActive ? 'success' : 'warning'}
                />
            )
        }
    ];

    const renderExpandedContent = (q: Question) => (
        <div className="p-4 rounded-lg bg-[var(--primary-light)] border border-[var(--primary)]/10">
            <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-[var(--primary)]" />
                <span className="text-[12px] font-semibold text-[var(--primary)] uppercase tracking-wider">Answer Guidance</span>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {q.answer || 'No answer guidance has been added for this question yet.'}
            </p>
        </div>
    );

    const renderGridItem = (q: Question, _: number, actions?: React.ReactNode) => (
        <div key={q.id} className="group/card relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-7 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[var(--primary)]/20 transition-all duration-500">
            {/* Background Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 text-[var(--primary)]/5 -rotate-12 group-hover/card:scale-110 transiton-transform duration-700 pointer-events-none">
                <FileQuestion size={160} strokeWidth={1} />
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-4 rounded-[1.5rem] bg-[var(--primary-light)] shadow-sm group-hover/card:rotate-6 transition-transform duration-500">
                    <FileQuestion size={24} className="text-[var(--primary)]" />
                </div>
                {actions}
            </div>

            <div className="relative z-10">
                <h3 className="text-[19px] font-bold text-[var(--text-primary)] mb-4 group-hover/card:text-[var(--primary)] transition-colors duration-300 tracking-tight line-clamp-2">
                    {q.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-50/50 border border-blue-100/50 text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-widest">{q.categoryName}</span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100/50 text-[10px] font-bold text-gray-500 shadow-sm uppercase tracking-widest">{q.subCategoryName}</span>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-bold opacity-60">
                        <Clock size={12} />
                        {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                    <StatusBadge
                        label={q.isActive ? 'Live' : 'Draft'}
                        variant={q.isActive ? 'success' : 'warning'}
                        pulse={q.isActive}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );

    const handleOpenModal = (q: Question | null = null) => {
        if (q) {
            setEditingQuestion(q);
            setFormData({
                title: q.title,
                answer: q.answer,
                categoryId: q.categoryId.toString(),
                subCategoryId: q.subCategoryId.toString(),
                isActive: q.isActive
            });
        } else {
            setEditingQuestion(null);
            setFormData({
                title: '',
                answer: '',
                categoryId: categories[0]?.value || '',
                subCategoryId: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingQuestion) {
                resultAction = await dispatch(editQuestion({
                    id: Number(editingQuestion.id),
                    data: { title: formData.title, answer: formData.answer, isActive: formData.isActive }
                }));
            } else {
                resultAction = await dispatch(addQuestion({
                    title: formData.title,
                    answer: formData.answer,
                    categoryId: parseInt(formData.categoryId),
                    subCategoryId: parseInt(formData.subCategoryId),
                    isActive: formData.isActive
                }));
            }

            if (addQuestion.fulfilled.match(resultAction) || editQuestion.fulfilled.match(resultAction)) {
                toast.success(`Question ${editingQuestion ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
            } else {
                toast.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setConfirmState({ open: false, id: null });
            const resultAction = await dispatch(removeQuestion(id));
            if (removeQuestion.fulfilled.match(resultAction)) {
                toast.success("Question deleted successfully");
            } else {
                toast.error(resultAction.payload as string || "Delete failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        q.subCategoryName?.toLowerCase().includes(search.toLowerCase())
    );

    const availableSubCategories = subCategories;

    return (
        <DashboardLayout>
            <PageHeader
                title="Questions"
                subtitle="Curate and manage technical interview questions."
                action={
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                    >
                        <Plus size={16} />
                        Add Question
                    </button>
                }
            />

            {/* Overview Stickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-[var(--primary)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <FileQuestion size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Total Questions</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.filter(q => q.isActive).length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Published</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                            <FileQuestion size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.filter(q => !q.isActive).length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Drafts</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                            <Shield size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">Admin</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Access Level</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <DataGrid
                    data={filteredQuestions}
                    loading={loading}
                    renderItem={renderGridItem}
                    onView={(q) => setViewingQuestion(q)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                    emptyIcon={FileQuestion}
                />
            ) : (
                <DataTable
                    data={filteredQuestions}
                    columns={columns}
                    loading={loading}
                    onView={(q) => setViewingQuestion(q)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                    renderExpanded={renderExpandedContent}
                />
            )}

            {/* Modal */}
            {/* Modal - Side Drawer Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Light clear overlay */}
                    <div className="absolute inset-0 bg-[var(--primary)]/5" onClick={() => setIsModalOpen(false)} />

                    <div className="absolute inset-y-0 right-0 w-full max-w-[600px] bg-white border-l border-gray-100 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.1)] animate-slide-in-right flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingQuestion ? 'Edit' : 'Create'} Question
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Fine-tune interview questions and answers.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-xl hover:bg-gray-50 text-[var(--text-muted)] transition-all hover:rotate-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <LookupSelect
                                        type="categories"
                                        label="Category"
                                        value={formData.categoryId}
                                        onChange={(val) => setFormData({ ...formData, categoryId: val.toString(), subCategoryId: '' })}
                                        disabled={!!editingQuestion}
                                        icon={FolderOpen}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div>
                                    <LookupSelect
                                        type="subCategories"
                                        label="Sub Category"
                                        parentId={Number(formData.categoryId)}
                                        value={formData.subCategoryId}
                                        onChange={(val) => setFormData({ ...formData, subCategoryId: val.toString() })}
                                        disabled={!!editingQuestion || !formData.categoryId}
                                        icon={GitBranch}
                                        placeholder="Select Sub Category"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Question Title</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors">
                                        <FileQuestion size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter the interview question..."
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-[13px] font-semibold text-[var(--text-primary)] placeholder:text-gray-400 focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Answer Guidance</label>
                                <textarea
                                    rows={8}
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Provide the model answer or guidance notes for interviewers..."
                                    className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-[13px] font-medium text-[var(--text-secondary)] placeholder:text-gray-400 focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all resize-none shadow-sm leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {formData.isActive ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-[var(--text-primary)]">Publish Status</p>
                                        <p className="text-[11px] text-[var(--text-muted)]">{formData.isActive ? 'Visible to candidates' : 'Saved as draft'}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-[14px] font-bold text-[var(--text-secondary)] hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                                >
                                    {editingQuestion ? 'Update Question' : 'Create Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmState.open}
                onClose={() => setConfirmState({ open: false, id: null })}
                onConfirm={() => confirmState.id !== null && handleDelete(confirmState.id)}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Question View Modal */}
            {viewingQuestion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingQuestion(null)} />
                    <div className="relative w-full max-w-[700px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="px-10 py-10 overflow-y-auto custom-scrollbar">
                            <button onClick={() => setViewingQuestion(null)} className="absolute top-8 right-8 p-2.5 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all z-10">
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 rounded-3xl bg-[var(--primary-light)] text-[var(--primary)] shadow-sm">
                                    <FileQuestion size={32} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">{viewingQuestion.categoryName}</span>
                                        <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-100/50">{viewingQuestion.subCategoryName}</span>
                                    </div>
                                    <h2 className="text-[24px] font-black tracking-tight text-[var(--text-primary)] leading-tight">{viewingQuestion.title}</h2>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <section className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100/50 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 rounded-lg bg-[var(--primary)] text-white">
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Expert Answer Guidance</h4>
                                    </div>
                                    <div className="prose prose-blue max-w-none">
                                        <p className="text-[15px] text-[var(--text-secondary)] font-medium leading-[1.8] whitespace-pre-wrap">
                                            {viewingQuestion.answer || "No answer guidance has been prepared for this challenge yet."}
                                        </p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Created On</p>
                                            <p className="text-[14px] font-extrabold text-[var(--text-primary)]">{new Date(viewingQuestion.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <Clock size={24} className="text-gray-200" />
                                    </div>
                                    <div className={`p-6 rounded-[2rem] border shadow-sm flex items-center justify-between ${viewingQuestion.isActive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Current State</p>
                                            <p className={`text-[14px] font-black ${viewingQuestion.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {viewingQuestion.isActive ? 'Published & Live' : 'Work in Progress / Draft'}
                                            </p>
                                        </div>
                                        <StatusBadge label={viewingQuestion.isActive ? 'Live' : 'Draft'} variant={viewingQuestion.isActive ? 'success' : 'warning'} size="sm" pulse={viewingQuestion.isActive} />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setViewingQuestion(null)}
                                        className="px-10 py-4 rounded-2xl bg-gray-900 text-white text-[15px] font-bold hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-200"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default QuestionManagementPage;
