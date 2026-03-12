"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column, SortDirection } from '@/components/shared/DataTable';
import { DataGrid } from '@/components/shared/DataGrid';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LookupSelect } from '@/components/shared/LookupSelect';
import { Plus, Search,
    LayoutGrid,
    List,
    X,
    FileQuestion,
    CheckCircle2,
    Clock,
    FolderOpen,
    GitBranch,
    ExternalLink,
    ToggleLeft
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchQuestions, addQuestion, editQuestion, removeQuestion, toggleQuestionStatus } from '@/store/slices/questionSlice';
import { fetchCategories, fetchSubCategories } from '@/store/slices/lookupSlice';
import { Question } from '@/types/question';
import { AnswerContent } from '@/components/shared/AnswerContent';
import { QuestionViewModal } from '@/features/dashboard/components/QuestionViewModal';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { QUESTION_LEVELS, QUESTION_LEVEL_VALUES, getQuestionLevelLabel } from '@/constants/questionLevels';
import type { QuestionLevel } from '@/constants/questionLevels';
import { notify } from '@/lib/notify';

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
        titleAr: '',
        answer: '',
        answerAr: '',
        categoryId: '',
        subCategoryId: '',
        level: 'Junior' as QuestionLevel,
        isActive: true
    });
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
    const [showPreviewEn, setShowPreviewEn] = useState(false);
    const [showPreviewAr, setShowPreviewAr] = useState(false);
    const [filterLevel, setFilterLevel] = useState<QuestionLevel | ''>('');
    const [filterCategoryId, setFilterCategoryId] = useState<string>('');
    const [filterSubCategoryId, setFilterSubCategoryId] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all');
    const [sortKey, setSortKey] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [pageSize, setPageSize] = useState(10);
    const answerEnRef = useRef<HTMLTextAreaElement>(null);
    const answerArRef = useRef<HTMLTextAreaElement>(null);

    const insertCodeAtCursor = useCallback((field: 'answer' | 'answerAr', snippet: string) => {
        const el = field === 'answer' ? answerEnRef.current : answerArRef.current;
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const val = field === 'answer' ? formData.answer : formData.answerAr;
            const newVal = val.slice(0, start) + snippet + val.slice(end);
            if (field === 'answer') setFormData(f => ({ ...f, answer: newVal }));
            else setFormData(f => ({ ...f, answerAr: newVal }));
            setTimeout(() => { el.focus(); el.setSelectionRange(start + snippet.length, start + snippet.length); }, 0);
        } else {
            const val = field === 'answer' ? formData.answer : formData.answerAr;
            const newVal = val + snippet;
            if (field === 'answer') setFormData(f => ({ ...f, answer: newVal }));
            else setFormData(f => ({ ...f, answerAr: newVal }));
        }
    }, [formData.answer, formData.answerAr]);

    useEffect(() => {
        dispatch(fetchQuestions());
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (formData.categoryId) {
            dispatch(fetchSubCategories(parseInt(formData.categoryId)));
        }
    }, [dispatch, formData.categoryId]);

    useEffect(() => {
        if (filterCategoryId) {
            dispatch(fetchSubCategories(parseInt(filterCategoryId)));
        }
    }, [dispatch, filterCategoryId]);

    const displayTitle = (q: Question) => (q.titleAr?.trim() ? q.titleAr : q.title);
    const displayTitleDir = (q: Question) => (q.titleAr?.trim() ? 'rtl' : 'ltr');

    const columns: Column<Question>[] = [
        {
            header: 'Question',
            key: 'title',
            render: (q: Question) => (
                <div className="max-w-[350px]">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1 mb-0.5" dir={displayTitleDir(q)}>{displayTitle(q)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-[var(--primary)] font-medium">{q.categoryName}</span>
                        <span className="text-[var(--text-light)]">·</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{q.subCategoryName}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Level',
            key: 'level',
            sortable: true,
            render: (q: Question) => (q.level != null ? <LevelBadge level={q.level} size="sm" /> : <span className="text-[11px] text-[var(--text-muted)]">—</span>)
        },
        {
            header: 'Created',
            key: 'createdAt',
            sortable: true,
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
            sortable: true,
            render: (q: Question) => (
                <StatusBadge
                    label={q.isActive ? 'Active' : 'Draft'}
                    variant={q.isActive ? 'success' : 'warning'}
                />
            )
        }
    ];

    const renderExpandedContent = (q: Question) => {
        const preview = (q.answer?.trim() || q.answerAr?.trim() || 'No answer yet.').slice(0, 120);
        const hasMore = (q.answer?.length ?? 0) + (q.answerAr?.length ?? 0) > 120;
        return (
            <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between gap-4">
                <p className="text-[13px] text-[var(--text-muted)] flex-1 min-w-0 truncate">
                    {preview}{hasMore ? '…' : ''}
                </p>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewingQuestion(q); }}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        View full
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(q); }}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </div>
        );
    };

    const renderGridItem = (q: Question, _: number, actions?: React.ReactNode) => (
        <div key={q.id} className="group/card relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[var(--shadow-card)] p-7 overflow-hidden hover:shadow-[var(--shadow-lg)] hover:border-[var(--primary)]/20 transition-all duration-500">
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
                <h3 className="text-[19px] font-bold text-[var(--text-primary)] mb-4 group-hover/card:text-[var(--primary)] transition-colors duration-300 tracking-tight line-clamp-2" dir={displayTitleDir(q)}>
                    {displayTitle(q)}
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--info-soft)] border border-[var(--info)]/20 text-[10px] font-bold text-[var(--info)] shadow-sm uppercase tracking-widest">{q.categoryName}</span>
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] shadow-sm uppercase tracking-widest">{q.subCategoryName}</span>
                    {q.level != null && <LevelBadge level={q.level} size="sm" />}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-light)]">
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
                titleAr: q.titleAr ?? '',
                answer: q.answer ?? '',
                answerAr: q.answerAr ?? '',
                categoryId: q.categoryId.toString(),
                subCategoryId: q.subCategoryId.toString(),
                level: (q.level ?? 'Junior') as QuestionLevel,
                isActive: q.isActive
            });
            dispatch(fetchSubCategories(q.categoryId));
        } else {
            setEditingQuestion(null);
            setFormData({
                title: '',
                titleAr: '',
                answer: '',
                answerAr: '',
                categoryId: categories[0]?.value || '',
                subCategoryId: '',
                level: 'Junior' as QuestionLevel,
                isActive: true
            });
            if (categories[0]?.value) dispatch(fetchSubCategories(Number(categories[0].value)));
        }
        setShowPreviewEn(false);
        setShowPreviewAr(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingQuestion) {
                resultAction = await dispatch(editQuestion({
                    id: Number(editingQuestion.id),
                    data: {
                        title: formData.title,
                        titleAr: formData.titleAr || null,
                        answer: formData.answer,
                        answerAr: formData.answerAr || null,
                        categoryId: parseInt(formData.categoryId),
                        subCategoryId: parseInt(formData.subCategoryId),
                        level: formData.level,
                        isActive: formData.isActive
                    }
                }));
            } else {
                resultAction = await dispatch(addQuestion({
                    title: formData.title,
                    titleAr: formData.titleAr || null,
                    answer: formData.answer,
                    answerAr: formData.answerAr || null,
                    categoryId: parseInt(formData.categoryId),
                    subCategoryId: parseInt(formData.subCategoryId),
                    level: formData.level,
                    isActive: formData.isActive
                }));
            }

            if (addQuestion.fulfilled.match(resultAction) || editQuestion.fulfilled.match(resultAction)) {
                notify.success(`Question ${editingQuestion ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
            } else {
                notify.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            notify.error("Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setConfirmState({ open: false, id: null });
            const resultAction = await dispatch(removeQuestion(id));
            if (removeQuestion.fulfilled.match(resultAction)) {
                notify.success("Question deleted successfully");
            } else {
                notify.error(resultAction.payload as string || "Delete failed");
            }
        } catch (err) {
            notify.error("Operation failed");
        }
    };

    const filteredQuestions = React.useMemo(() => {
        let list = questions.filter(q => {
            const s = search.toLowerCase();
            const matchesSearch = q.title.toLowerCase().includes(s) ||
                (q.titleAr?.toLowerCase().includes(s) ?? false) ||
                q.categoryName?.toLowerCase().includes(s) ||
                q.subCategoryName?.toLowerCase().includes(s) ||
                getQuestionLevelLabel(q.level).toLowerCase().includes(s);
            if (!matchesSearch) return false;
            if (filterLevel !== '' && (q.level == null || QUESTION_LEVEL_VALUES[filterLevel as QuestionLevel] !== Number(q.level))) return false;
            if (filterCategoryId !== '' && Number(q.categoryId) !== Number(filterCategoryId)) return false;
            if (filterSubCategoryId !== '' && Number(q.subCategoryId) !== Number(filterSubCategoryId)) return false;
            if (filterStatus === 'active' && !q.isActive) return false;
            if (filterStatus === 'draft' && q.isActive) return false;
            return true;
        });
        const mult = sortDirection === 'desc' ? -1 : 1;
        list = [...list].sort((a, b) => {
            if (sortKey === 'title') {
                const va = displayTitle(a).toLowerCase();
                const vb = displayTitle(b).toLowerCase();
                return mult * (va < vb ? -1 : va > vb ? 1 : 0);
            }
            if (sortKey === 'level') {
                const va = a.level ?? -1;
                const vb = b.level ?? -1;
                return mult * (va - vb);
            }
            if (sortKey === 'createdAt') {
                const va = new Date(a.createdAt).getTime();
                const vb = new Date(b.createdAt).getTime();
                return mult * (va - vb);
            }
            if (sortKey === 'isActive') {
                const va = a.isActive ? 1 : 0;
                const vb = b.isActive ? 1 : 0;
                return mult * (va - vb);
            }
            return 0;
        });
        return list;
    }, [questions, search, filterLevel, filterCategoryId, filterSubCategoryId, filterStatus, sortKey, sortDirection]);

    const handleSort = useCallback((key: string, direction: SortDirection) => {
        setSortKey(key);
        setSortDirection(direction);
    }, []);

    const handleToggleStatus = useCallback(async (q: Question) => {
        const resultAction = await dispatch(toggleQuestionStatus(Number(q.id)));
        if (toggleQuestionStatus.fulfilled.match(resultAction)) {
            notify.success(q.isActive ? 'Question set to draft' : 'Question published');
        } else {
            notify.error((resultAction.payload as string) || 'Failed to toggle status');
        }
    }, [dispatch]);

    return (
        <DashboardLayout>
            <div className="w-full">
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

            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.length}</p>
                            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Total</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                            <FileQuestion size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.filter(q => q.isActive).length}</p>
                            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Published</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{questions.filter(q => !q.isActive).length}</p>
                            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Drafts</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]">
                            <FileQuestion size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar: search | filters group | actions (clear + view switch) */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[1.5rem] p-6 mb-8 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Primary: Search */}
                    <div className="relative w-full lg:max-w-[420px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                        <input
                            type="text"
                            placeholder="Search by title, category, module or level..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[13.5px] text-[var(--text-primary)] font-medium placeholder:text-[var(--text-light)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>

                    {/* Secondary: Actions (View Switch) */}
                    <div className="flex items-center gap-3 self-end lg:self-auto">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mr-1">View Mode</span>
                        <div className="flex items-center gap-1 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl p-1.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' : 'text-[var(--text-muted)] hover:bg-[var(--border-color)]/30'}`}
                                title="Grid view"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' : 'text-[var(--text-muted)] hover:bg-[var(--border-color)]/30'}`}
                                title="Table view"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2.5 mr-2">
                             <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                                <ToggleLeft size={16} />
                             </div>
                             <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Refine by</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value as QuestionLevel | '')}
                                className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[13px] font-semibold text-[var(--text-secondary)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none min-w-[130px] transition-all hover:border-[var(--primary)]/30"
                            >
                                <option value="">Level: All</option>
                                {QUESTION_LEVELS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>

                            <select
                                value={filterCategoryId}
                                onChange={(e) => { setFilterCategoryId(e.target.value); setFilterSubCategoryId(''); }}
                                className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[13px] font-semibold text-[var(--text-secondary)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none min-w-[160px] transition-all hover:border-[var(--primary)]/30"
                            >
                                <option value="">Category: All</option>
                                {categories.map((c) => <option key={String(c.value)} value={c.value}>{c.label}</option>)}
                            </select>

                            <select
                                value={filterSubCategoryId}
                                onChange={(e) => setFilterSubCategoryId(e.target.value)}
                                className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[13px] font-semibold text-[var(--text-secondary)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none min-w-[160px] transition-all hover:border-[var(--primary)]/30"
                                disabled={!filterCategoryId}
                            >
                                <option value="">Module: All</option>
                                {subCategories.map((s) => (
                                    <option key={String(s.value)} value={s.value}>{s.label}</option>
                                ))}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'draft')}
                                className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[13px] font-semibold text-[var(--text-secondary)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none min-w-[130px] transition-all hover:border-[var(--primary)]/30"
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active (Live)</option>
                                <option value="draft">Draft (Private)</option>
                            </select>

                            {(search || filterLevel || filterCategoryId || filterSubCategoryId || filterStatus !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setFilterLevel('');
                                        setFilterCategoryId('');
                                        setFilterSubCategoryId('');
                                        setFilterStatus('all');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-[var(--danger)] hover:bg-[var(--danger-soft)] border border-transparent hover:border-[var(--danger)]/20 transition-all active:scale-95"
                                >
                                    <X size={14} />
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>
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
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onToggleStatus={handleToggleStatus}
                    onOpenInBank={() => {}}
                />
            )}

            {/* Edit/Create – static modal: fixed header/footer, only body scrolls */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm" onClick={() => setIsModalOpen(false)} aria-hidden />
                    <div className="relative w-full max-w-[1000px] h-[90vh] max-h-[90vh] flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-lg)] overflow-hidden">
                        {/* Fixed header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-light)] flex-shrink-0">
                            <div>
                                <h2 className="text-[20px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingQuestion ? 'Edit' : 'Create'} Question
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Title, category, module, and answers (Markdown + code blocks supported).</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-xl text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable form body only */}
                        <form id="edit-question-form" onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                            <div className="flex-1 min-h-0 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[var(--card)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <LookupSelect
                                        type="categories"
                                        label="Category"
                                        value={formData.categoryId}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val.toString(), subCategoryId: '' }))}
                                        icon={FolderOpen}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div>
                                    <LookupSelect
                                        type="subCategories"
                                        label="Module"
                                        parentId={Number(formData.categoryId)}
                                        value={formData.subCategoryId}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, subCategoryId: val.toString() }))}
                                        disabled={!formData.categoryId}
                                        icon={GitBranch}
                                        placeholder="Select module"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value as QuestionLevel }))}
                                    className="w-full bg-[var(--card)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[13px] font-semibold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                >
                                    {QUESTION_LEVELS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Question Title (English)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <FileQuestion size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter the interview question..."
                                        className="w-full bg-[var(--card)] border border-[var(--border-color)] rounded-xl py-3 pl-11 pr-4 text-[13px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Question Title (العربية) <span className="font-normal normal-case">(optional)</span></label>
                                <input
                                    type="text"
                                    value={formData.titleAr}
                                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                    placeholder="عنوان السؤال بالعربية"
                                    dir="rtl"
                                    className="w-full bg-[var(--card)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[13px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm text-right"
                                />
                            </div>

                            <div className="space-y-8">
                                <p className="text-[12px] text-[var(--text-muted)] font-medium">
                                    Markdown supported: <strong>**bold**</strong>, headings, lists. Use code fences for code: <code className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--primary)] text-[11px]">```csharp</code> … <code className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--primary)] text-[11px]">```</code>
                                </p>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Answer (English) <span className="font-normal normal-case">(optional for drafts)</span></label>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] text-[var(--text-muted)]">Insert:</span>
                                                <button type="button" onClick={() => insertCodeAtCursor('answer', '\n```\n\n```\n')} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors">Code</button>
                                                <button type="button" onClick={() => insertCodeAtCursor('answer', '\n```csharp\n\n```\n')} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors">C#</button>
                                                <button type="button" onClick={() => insertCodeAtCursor('answer', '\n```javascript\n\n```\n')} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors">JS</button>
                                                <button type="button" onClick={() => setShowPreviewEn(p => !p)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] transition-colors">{showPreviewEn ? 'Hide preview' : 'Preview'}</button>
                                            </div>
                                        </div>
                                        <textarea
                                            ref={answerEnRef}
                                            rows={12}
                                            value={formData.answer}
                                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                            placeholder="Model answer or explanation in English. Use code blocks for snippets."
                                            className="w-full min-h-[220px] bg-[var(--card)] border border-[var(--border-color)] rounded-xl py-4 px-5 text-[13px] font-medium text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all resize-y shadow-sm leading-relaxed"
                                        />
                                        {showPreviewEn && formData.answer?.trim() && (
                                            <div className="mt-3 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                                                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Preview</p>
                                                <AnswerContent content={formData.answer} lang="en" compact />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Answer (Arabic) <span className="font-normal normal-case">(optional)</span></label>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] text-[var(--text-muted)]">Insert:</span>
                                                <button type="button" onClick={() => insertCodeAtCursor('answerAr', '\n```\n\n```\n')} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors">Code</button>
                                                <button type="button" onClick={() => insertCodeAtCursor('answerAr', '\n```csharp\n\n```\n')} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors">C#</button>
                                                <button type="button" onClick={() => setShowPreviewAr(p => !p)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] transition-colors">{showPreviewAr ? 'Hide preview' : 'Preview'}</button>
                                            </div>
                                        </div>
                                        <textarea
                                            ref={answerArRef}
                                            rows={12}
                                            value={formData.answerAr}
                                            onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                                            placeholder="الإجابة أو الشرح بالعربية..."
                                            dir="rtl"
                                            className="w-full min-h-[220px] bg-[var(--card)] border border-[var(--border-color)] rounded-xl py-4 px-5 text-[13px] font-medium text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all resize-y shadow-sm leading-relaxed"
                                        />
                                        {showPreviewAr && formData.answerAr?.trim() && (
                                            <div className="mt-3 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                                                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Preview</p>
                                                <AnswerContent content={formData.answerAr} lang="ar" compact />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isActive ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--warning-soft)] text-[var(--warning)]'}`}>
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
                                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-[var(--surface-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--card)] after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                </label>
                            </div>
                            </div>
                        </form>

                        {/* Fixed footer */}
                        <div className="flex-shrink-0 flex gap-4 px-8 py-6 border-t border-[var(--border-light)] bg-[var(--card)]">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-3.5 rounded-xl border border-[var(--border-color)] text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-question-form"
                                className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                            >
                                {editingQuestion ? 'Update Question' : 'Create Question'}
                            </button>
                        </div>
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

            {viewingQuestion && (
                <QuestionViewModal
                    question={viewingQuestion}
                    onClose={() => setViewingQuestion(null)}
                />
            )}
            </div>
        </DashboardLayout>
    );
};

export default QuestionManagementPage;
